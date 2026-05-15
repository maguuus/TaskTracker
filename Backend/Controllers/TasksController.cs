using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(AppDbContext context) : ControllerBase
{
    [HttpGet("column/{columnId:guid}")]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetTasksByColumn(Guid columnId)
    {
        var tasks = await context.TaskItems
            .Where(x => x.ColumnId == columnId)
            .OrderBy(x => x.OrderIndex)
            .Select(t => new TaskResponseDto(t.Id, t.Title, t.Description, t.Priority, t.Urgency, t.OrderIndex,
                t.ColumnId, t.CreatedAt, t.UpdatedAt, t.DueDate, t.PlannedStartAt))
            .ToListAsync();
        
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask(TaskCreateDto taskDto)
    {
        if (!await context.Columns.AnyAsync(x => x.Id == taskDto.ColumnId))
            return NotFound("Column not found");

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
        
        return Ok(new TaskResponseDto(task.Id, task.Title, task.Description, task.Priority, task.Urgency, task.OrderIndex, task.ColumnId, task.CreatedAt, task.UpdatedAt, task.DueDate, task.PlannedStartAt));
    }
    
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateTask(Guid id, TaskUpdateDto taskDto)
    {
        var task = await context.TaskItems.FindAsync(id);
        if (task == null) 
            return NotFound("Task not found");

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
        return NoContent();
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var task = await context.TaskItems.FindAsync(id);
        if (task == null) 
            return NotFound();

        context.TaskItems.Remove(task);
        await context.SaveChangesAsync();
        return NoContent();
    }
}