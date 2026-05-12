using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(AppDbContext context) : ControllerBase
{
    [HttpGet("column/{columnId:guid}")]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasksByColumn(Guid columnId)
    {
        return await context.TaskItems
            .Where(t => t.ColumnId == columnId)
            .OrderBy(t => t.OrderIndex)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
    {
        var column = await context.Columns.FindAsync(task.ColumnId);
        if (column == null)
        {
            return NotFound("Column not found");
        }
        context.TaskItems.Add(task);
        await context.SaveChangesAsync();
        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var task = await context.TaskItems.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }
        context.TaskItems.Remove(task);
        await context.SaveChangesAsync();
        return NoContent();
    }
}