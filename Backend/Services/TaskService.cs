using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class TaskService(AppDbContext context, IRealtimeNotifier realtimeNotifier) : ITaskService
{
    public async Task<IEnumerable<TaskResponseDto>> GetTasksByColumnAsync(Guid columnId)
    {
        var tasks = await context.TaskItems
            .Where(x => x.ColumnId == columnId)
            .OrderBy(x => x.OrderIndex)
            .Select(t => new TaskResponseDto(
                t.Id,
                t.Title,
                t.Description,
                t.Priority,
                t.Urgency,
                t.Icon,
                t.Tags,
                t.OrderIndex,
                t.ColumnId,
                t.CreatedAt,
                t.UpdatedAt,
                t.DueDate,
                t.PlannedStartAt))
            .ToListAsync();

        return tasks;
    }

    public async Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto taskDto)
    {
        var column = await context.Columns.AsNoTracking().FirstOrDefaultAsync(x => x.Id == taskDto.ColumnId);
        if (column == null)
            throw new InvalidOperationException("Column not found");

        var now = DateTime.UtcNow;
        var roundedDate = new DateTime(now.Ticks - (now.Ticks % TimeSpan.TicksPerMillisecond), DateTimeKind.Utc);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = taskDto.Title,
            Description = taskDto.Description,
            Priority = taskDto.Priority,
            Urgency = taskDto.Urgency,
            Icon = taskDto.Icon,
            Tags = taskDto.Tags,
            OrderIndex = taskDto.OrderIndex,
            ColumnId = taskDto.ColumnId,
            DueDate = taskDto.DueDate,
            PlannedStartAt = taskDto.PlannedStartAt,
            CreatedAt = roundedDate,
            UpdatedAt = roundedDate
        };

        context.TaskItems.Add(task);
        await context.SaveChangesAsync();

        var response = new TaskResponseDto(
            task.Id,
            task.Title,
            task.Description,
            task.Priority,
            task.Urgency,
            task.Icon,
            task.Tags,
            task.OrderIndex,
            task.ColumnId,
            task.CreatedAt,
            task.UpdatedAt,
            task.DueDate,
            task.PlannedStartAt);

        // Уведомление уходит ТОЛЬКО участникам доски этого проекта
        await realtimeNotifier.NotifyProjectGroupAsync(column.ProjectId, "task", "created", new { task = response });

        return response;
    }

    public async Task<TaskResponseDto> UpdateTaskAsync(Guid id, TaskUpdateDto taskDto)
    {
        var task = await context.TaskItems.Include(t => t.Column).FirstOrDefaultAsync(t => t.Id == id);
        if (task == null)
            throw new InvalidOperationException("Task not found");

        Guid targetProjectId;

        if (taskDto.ColumnId != task.ColumnId)
        {
            var targetColumn = await context.Columns.FirstOrDefaultAsync(x => x.Id == taskDto.ColumnId);
            if (targetColumn == null)
                throw new InvalidOperationException("Target column not found");

            targetProjectId = targetColumn.ProjectId;

            int maxOrderIndex = await context.TaskItems
                .Where(t => t.ColumnId == taskDto.ColumnId)
                .Select(t => (int?)t.OrderIndex)
                .MaxAsync() ?? -1;

            task.OrderIndex = maxOrderIndex + 1;
        }
        else
        {
            task.OrderIndex = taskDto.OrderIndex;
            targetProjectId = task.Column?.ProjectId ?? await context.Columns
                .Where(c => c.Id == task.ColumnId)
                .Select(c => c.ProjectId)
                .FirstOrDefaultAsync();
        }

        // Проверка оптимистичной блокировки по UpdatedAt
        context.Entry(task).Property(t => t.UpdatedAt).OriginalValue = taskDto.UpdatedAt;

        task.Title = taskDto.Title;
        task.Description = taskDto.Description;
        task.Priority = taskDto.Priority;
        task.Urgency = taskDto.Urgency;
        task.Icon = taskDto.Icon;
        task.Tags = taskDto.Tags;
        task.ColumnId = taskDto.ColumnId;
        task.DueDate = taskDto.DueDate;
        task.PlannedStartAt = taskDto.PlannedStartAt;

        // Округляем до миллисекунд (3 знака после запятой) для полного совпадения с JS/JSON
        var now = DateTime.UtcNow;
        task.UpdatedAt = new DateTime(now.Ticks - (now.Ticks % TimeSpan.TicksPerMillisecond), DateTimeKind.Utc);

        await context.SaveChangesAsync();

        var response = new TaskResponseDto(
            task.Id,
            task.Title,
            task.Description,
            task.Priority,
            task.Urgency,
            task.Icon,
            task.Tags,
            task.OrderIndex,
            task.ColumnId,
            task.CreatedAt,
            task.UpdatedAt,
            task.DueDate,
            task.PlannedStartAt);

        // Отправка актуальной версии задачи в комнату проекта
        await realtimeNotifier.NotifyProjectGroupAsync(targetProjectId, "task", "updated", new { taskId = id, task = response });

        return response;
    }

    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await context.TaskItems.Include(t => t.Column).FirstOrDefaultAsync(t => t.Id == id);
        if (task == null)
            throw new InvalidOperationException("Task not found");

        var projectId = task.Column?.ProjectId ?? await context.Columns
            .Where(c => c.Id == task.ColumnId)
            .Select(c => c.ProjectId)
            .FirstOrDefaultAsync();

        var columnId = task.ColumnId;

        context.TaskItems.Remove(task);
        await context.SaveChangesAsync();

        if (projectId != Guid.Empty)
        {
            await realtimeNotifier.NotifyProjectGroupAsync(projectId, "task", "deleted", new { taskId = id, columnId });
        }

        return true;
    }
}