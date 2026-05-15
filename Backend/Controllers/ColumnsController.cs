using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ColumnsController(AppDbContext context) : ControllerBase
{

    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult<IEnumerable<ColumnResponseDto>>> GetColumnsByProject(Guid projectId)
    {
        var columns = await context.Columns
            .Where(c => c.ProjectId == projectId)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new ColumnResponseDto(c.Id, c.Title, c.OrderIndex, c.ProjectId))
            .ToListAsync();

        return Ok(columns);
    }
    
    

    [HttpPost]
    public async Task<ActionResult<ColumnResponseDto>> CreateColumn(ColumnCreateDto columnDto)
    {
        if (!await context.Projects.AnyAsync(p => p.Id == columnDto.ProjectId))
            return NotFound("Project not found");

        var column = new Column
        {
            Id = Guid.NewGuid(),
            Title = columnDto.Title,
            OrderIndex = columnDto.OrderIndex,
            ProjectId = columnDto.ProjectId
        };
        
        context.Columns.Add(column);
        await context.SaveChangesAsync();
        
        return Ok(new ColumnResponseDto(column.Id, column.Title, column.OrderIndex, column.ProjectId));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateColumn(Guid id, ColumnUpdateDto columnDto)
    {
        var column = await context.Columns.FindAsync(id);
        if (column == null)
            return NotFound("Column not found");
        
        column.Title = columnDto.Title;
        column.OrderIndex = columnDto.OrderIndex;
        await context.SaveChangesAsync();
        return NoContent();
    }
    

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteColumn(Guid id)
    {
        var column = await context.Columns.FindAsync(id);
        if (column == null)
            return NotFound();

        context.Columns.Remove(column);
        await context.SaveChangesAsync();

        return NoContent();
    }
}