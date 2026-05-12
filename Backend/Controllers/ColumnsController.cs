using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ColumnsController(AppDbContext context) : ControllerBase
{

    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult<IEnumerable<Column>>> GetColumnsByProject(Guid projectId)
    {
        return await context.Columns
            .Where(c => c.ProjectId == projectId)
            .OrderBy(c => c.OrderIndex)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Column>> CreateColumn(Column column)
    {
        var project = await context.Projects.FindAsync(column.ProjectId);
        if (project == null)
        {
            return NotFound("Проект не найден");
        }

        context.Columns.Add(column);
        await context.SaveChangesAsync();
        
        return Ok(column);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteColumn(Guid id)
    {
        var column = await context.Columns.FindAsync(id);
        if (column == null)
        {
            return NotFound();
        }

        context.Columns.Remove(column);
        await context.SaveChangesAsync();

        return NoContent();
    }
}