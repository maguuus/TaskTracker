using System.Security.Claims;
using Backend.DTO;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class TaskService(AppDbContext context, IRealtimeNotifier realtimeNotifier, IHttpContextAccessor httpContextAccessor) : ITaskService
{
    private Guid? CurrentUserId => Guid.TryParse(httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
        ? userId
        : null;

    public async Task<IEnumerable<TaskResponseDto>> GetTasksByColumnAsync(Guid columnId)
    {
        var tasks = await context.TaskItems
            .Where(x => x.ColumnId == columnId)
            .OrderBy(x => x.OrderIndex)
            .Select(t => new TaskResponseDto(t.Id, t.Title, t.Description, t.Priority, t.Urgency, t.Icon, t.Tags, t.OrderIndex,
                t.ColumnId, t.CreatedAt, t.UpdatedAt, t.DueDate, t.PlannedStartAt))
            .ToListAsync();
        
        return tasks;
    }
    public async Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto taskDto)
    {
        if (!await context.Columns.AnyAsync(x => x.Id == taskDto.ColumnId))
            throw new InvalidOperationException("Column not found");

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
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.TaskItems.Add(task);
        await context.SaveChangesAsync();
        
        var response = new TaskResponseDto(task.Id, 
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

        await realtimeNotifier.NotifyStateChangedAsync("task", "created", new { task = response }, CurrentUserId);
        return response;
    }
    public async Task<TaskResponseDto> UpdateTaskAsync(Guid id, TaskUpdateDto taskDto)
    {
        var task = await context.TaskItems.FindAsync(id);
        if (task == null) 
            throw new InvalidOperationException("Task not found");
        if (taskDto.ColumnId != task.ColumnId)
        {
            if (!await context.Columns.AnyAsync(x => x.Id == taskDto.ColumnId))
                throw new InvalidOperationException("Target column not found");
            int maxOrderIndex = await context.TaskItems.
                Where(t => t.ColumnId == taskDto.ColumnId).
                Select(t => (int?)t.OrderIndex)
                .MaxAsync() ?? -1;
            task.OrderIndex = maxOrderIndex + 1;
        }
        else
        {
            task.OrderIndex = taskDto.OrderIndex;//а типо нафиг это нужно? мы же никак не меняем
        }
        
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
        task.UpdatedAt = DateTime.UtcNow;

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

        await realtimeNotifier.NotifyStateChangedAsync("task", "updated", new { taskId = id, task = response }, CurrentUserId);
        return response;
    }
    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await context.TaskItems.FindAsync(id);
        if (task == null) 
            throw new InvalidOperationException("Task not found");

        context.TaskItems.Remove(task);
        await context.SaveChangesAsync();
        await realtimeNotifier.NotifyStateChangedAsync("task", "deleted", new { taskId = id }, CurrentUserId);
        return true;
    }
}