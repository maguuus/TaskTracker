using System.Security.Claims;
using Backend.Data;
using System.Collections.Concurrent;
using Backend.DTO;
using Backend.Queue;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Hubs;

[Authorize]
public class TaskTrackerHub(ITaskService taskService, IColumnService columnService, IProjectAccessService accessService, RequestQueueManager requestQueueManager, IRealtimeNotifier notifier) : Hub
{
    public static readonly ConcurrentDictionary<string, HashSet<string>> UserConnections = new();
    private static readonly ConcurrentDictionary<Guid, HashSet<string>> ProjectConnections = new();
    private Guid CurrentUserId => Guid.Parse(Context.UserIdentifier!);
    public static IEnumerable<string> GetConnectionIdsForUser(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Enumerable.Empty<string>();

        return UserConnections.TryGetValue(userId, out var connections)
            ? connections.ToArray()
            : Enumerable.Empty<string>();
    }

    public static IEnumerable<string> GetConnectionIdsForProject(Guid projectId)
    {
        if (!ProjectConnections.TryGetValue(projectId, out var connections))
            return Enumerable.Empty<string>();
        lock (connections)
        {
            return connections.ToArray();
        }
    }

    public override Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            UserConnections.AddOrUpdate(
                userId,
                _ => new HashSet<string> { Context.ConnectionId },
                (_, connections) =>
                {
                    connections.Add(Context.ConnectionId);
                    return connections;
                });
        }

        return base.OnConnectedAsync();
    }
    
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrWhiteSpace(userId) && UserConnections.TryGetValue(userId, out var connections))
        {
            connections.Remove(Context.ConnectionId);
            foreach (var project in ProjectConnections)
            {
                lock (project.Value)
                {
                    project.Value.Remove(Context.ConnectionId);

                    if (project.Value.Count == 0)
                    {
                        ProjectConnections.TryRemove(project.Key, out _);
                        requestQueueManager.RemoveQueue(project.Key);
                    }
                }
            }
            notifier.RemoveConnection(Context.ConnectionId);
        }

        return base.OnDisconnectedAsync(exception);
    }

    public async Task JoinProject(Guid projectId)
    {
        if (!await accessService.CanViewProjectAsync(CurrentUserId, projectId))
            throw new HubException("У вас нет доступа к этому проекту.");
        await Groups.AddToGroupAsync(Context.ConnectionId, $"project-{projectId}");
        var connections = ProjectConnections.GetOrAdd(projectId, _ => new HashSet<string>());
        lock (connections)
        {
            connections.Add(Context.ConnectionId);
        }
    }

    public async Task LeaveProject(Guid projectId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"project-{projectId}");

        if (ProjectConnections.TryGetValue(projectId, out var connections))
        {
            lock (connections)
            {
                connections.Remove(Context.ConnectionId);

                if (connections.Count == 0)
                {
                    ProjectConnections.TryRemove(projectId, out _);
                    requestQueueManager.RemoveQueue(projectId);
                }
            }
        }
    }

    public async Task<TaskResponseDto?> CreateTask(TaskCreateDto taskDto)
    {
        if (!await accessService.CanEditColumnAsync(CurrentUserId, taskDto.ColumnId))
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Только Owner или Member могут создавать задачи.");
            return null;
        }

        var projectId = await accessService.GetProjectIdByColumnAsync(taskDto.ColumnId);
        if (projectId == null)
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Project not found");
            return null;
        }

        try
        {
            return await requestQueueManager.EnqueueRequest(
                projectId.Value,
                Context.ConnectionId,
                "task",
                "created",
                taskDto.Version,
                () => taskService.CreateTaskAsync(taskDto),
                (dto, version) => dto with { Version = version });
        }
        catch
        {
            return null;
        }
    }

    public async Task<TaskResponseDto?> UpdateTask(Guid id, TaskUpdateDto taskDto)
    {
        if (!await accessService.CanEditTaskAsync(CurrentUserId, id))
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Только Owner или Member могут изменять задачи.");
            return null;
        }

        if (!await accessService.CanEditColumnAsync(CurrentUserId, taskDto.ColumnId))
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Нельзя переместить задачу в чужую колонку.");
            return null;
        }

        var projectId = await accessService.GetProjectIdByTaskAsync(id);
        if (projectId == null)
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Project not found");
            return null;
        }

        try
        {
            return await requestQueueManager.EnqueueRequest(projectId.Value, Context.ConnectionId, "task", "updated", taskDto.Version,
                () => taskService.UpdateTaskAsync(id, taskDto), (dto, version) => dto with { Version = version });
        }
        catch
        {
            return null;
        }
    }

    public async Task<DeleteResponseDto?> DeleteTask(Guid id, DeleteDto deleteDto)
    {
        if (!await accessService.CanEditTaskAsync(CurrentUserId, id))
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Только Owner или Member могут удалять задачи.");
            return null;
        }

        var projectId = await accessService.GetProjectIdByTaskAsync(id);
        if (projectId == null)
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Project not found");
            return null;
        }

        try
        {
            return await requestQueueManager.EnqueueRequest(
                projectId.Value,
                Context.ConnectionId,
                "task",
                "deleted",
                deleteDto.Version,
                async () =>
                {
                    await taskService.DeleteTaskAsync(id);
                    return new DeleteResponseDto(id, 0);
                },
                (dto, version) => dto with { Version = version });
        }
        catch
        {
            return null;
        }
    }

    public async Task<ColumnResponseDto?> CreateColumn(ColumnCreateDto columnDto)
    {
        if (!await accessService.CanEditProjectContentAsync(CurrentUserId, columnDto.ProjectId))
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Только Owner или Member могут добавлять колонки.");
            return null;
        }

        try
        {
            return await requestQueueManager.EnqueueRequest(
                columnDto.ProjectId,
                Context.ConnectionId,
                "column",
                "created",
                columnDto.Version,
                () => columnService.CreateColumnAsync(columnDto),
                (dto, version) => dto with { Version = version });
        }
        catch
        {
            return null;
        }
    }

    public async Task<ColumnResponseDto?> UpdateColumn(Guid id, ColumnUpdateDto columnDto)
    {
        if (!await accessService.CanEditColumnAsync(CurrentUserId, id))
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Только Owner или Member могут редактировать колонки.");
            return null;
        }

        var projectId = await accessService.GetProjectIdByColumnAsync(id);
        if (projectId == null)
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Project not found");
            return null;
        }

        try
        {
            return await requestQueueManager.EnqueueRequest(
                projectId.Value,
                Context.ConnectionId,
                "column",
                "updated",
                columnDto.Version,
                async () =>
                {
                    await columnService.UpdateColumnAsync(id, columnDto);
                    return new ColumnResponseDto(id, columnDto.Title, columnDto.OrderIndex, projectId.Value);
                },
                (dto, version) => dto with { Version = version });
        }
        catch
        {
            return null;
        }
    }

    public async Task<DeleteResponseDto?> DeleteColumn(Guid id, DeleteDto deleteDto)
    {
        if (!await accessService.CanEditColumnAsync(CurrentUserId, id))
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Только Owner или Member могут удалять колонки.");
            return null;
        }

        var projectId = await accessService.GetProjectIdByColumnAsync(id);
        if (projectId == null)
        {
            await notifier.NotifyErrorAsync(Context.ConnectionId, "Project not found");
            return null;
        }

        try
        {
            return await requestQueueManager.EnqueueRequest(
                projectId.Value,
                Context.ConnectionId,
                "column",
                "deleted",
                deleteDto.Version,
                async () =>
                {
                    await columnService.DeleteColumnAsync(id);
                    return new DeleteResponseDto(id, 0);
                },
                (dto, version) => dto with { Version = version });
        }
        catch
        {
            return null;
        }
    }
}