using Backend.DTO;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class TaskService: ITaskService
{
    private readonly AppDbContext context;
    public TaskService(AppDbContext context)
    {
        this.context = context;
    }
    public async Task<IEnumerable<TaskResponseDto>> GetTasksByColumnAsync(Guid columnId)
    {
        var tasks = await context.TaskItems
            .Where(x => x.ColumnId == columnId)
            .OrderBy(x => x.OrderIndex)
            .Select(t => new TaskResponseDto(t.Id, t.Title, t.Description, t.Priority, t.Urgency, t.OrderIndex,
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
            OrderIndex = taskDto.OrderIndex,
            ColumnId = taskDto.ColumnId,
            DueDate = taskDto.DueDate,
            PlannedStartAt = taskDto.PlannedStartAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.TaskItems.Add(task);
        await context.SaveChangesAsync();
        
        return new TaskResponseDto(task.Id, 
            task.Title, 
            task.Description, 
            task.Priority, 
            task.Urgency, 
            task.OrderIndex, 
            task.ColumnId, 
            task.CreatedAt, 
            task.UpdatedAt, 
            task.DueDate, 
            task.PlannedStartAt);
    }
    public async Task<bool> UpdateTaskAsync(Guid id, TaskUpdateDto taskDto)
    {
        var task = await context.TaskItems.FindAsync(id);
        if (task == null) 
            throw new InvalidOperationException("Task not found");

        task.Title = taskDto.Title;
        task.Description = taskDto.Description;
        task.Priority = taskDto.Priority;
        task.Urgency = taskDto.Urgency;
        task.OrderIndex = taskDto.OrderIndex;
        task.ColumnId = taskDto.ColumnId;
        task.DueDate = taskDto.DueDate;
        task.PlannedStartAt = taskDto.PlannedStartAt;
        task.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await context.TaskItems.FindAsync(id);
        if (task == null) 
            throw new InvalidOperationException("Task not found");

        context.TaskItems.Remove(task);
        await context.SaveChangesAsync();
        return true;
    }
}