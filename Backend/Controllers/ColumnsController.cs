using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ColumnsController(IColumnService columnService) : ControllerBase
{

    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult<IEnumerable<ColumnResponseDto>>> GetColumnsByProject(Guid projectId)
    {
        var columns = await columnService.GetColumnsByProjectAsync(projectId);
        return Ok(columns);
    }
    
    

    [HttpPost]
    public async Task<ActionResult<ColumnResponseDto>> CreateColumn(ColumnCreateDto columnDto)
    {
        try{
            var columnResponseDto = await columnService.CreateColumnAsync(columnDto);
            
            return Ok(columnResponseDto);
        }
        catch(InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateColumn(Guid id, ColumnUpdateDto columnDto)
    {
        try
        {
            await columnService.UpdateColumnAsync(id, columnDto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteColumn(Guid id)
    {
        try
        {
            await columnService.DeleteColumnAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound();
        }
    }
}