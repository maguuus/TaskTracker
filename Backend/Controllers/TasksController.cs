using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController(ITaskService taskService) : ControllerBase
{
    [HttpGet("column/{columnId:guid}")]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetTasksByColumn(Guid columnId)
    {
        var tasks = await taskService.GetTasksByColumnAsync(columnId);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask(TaskCreateDto taskDto)
    {
        try{
            var taskResponseDto = await taskService.CreateTaskAsync(taskDto);
            
            return Ok(taskResponseDto);
        }
        catch(InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateTask(Guid id, TaskUpdateDto taskDto)
    {
        try
        {
            await taskService.UpdateTaskAsync(id, taskDto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        try
        {
            await taskService.DeleteTaskAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound();
        }
    }
}