using System.Security.Claims;
using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController(ITaskService taskService, IProjectAccessService accessService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpGet("column/{columnId:guid}")]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetTasksByColumn(Guid columnId)
    {
        if (!await accessService.CanViewColumnAsync(CurrentUserId, columnId))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "У вас нет доступа к этой доске.");
        }
        var tasks = await taskService.GetTasksByColumnAsync(columnId);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask(TaskCreateDto taskDto)
    {
        if (!await accessService.CanEditColumnAsync(CurrentUserId, taskDto.ColumnId))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Только Owner или Member могут создавать задачи.");
        }
        try {
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
        if (!await accessService.CanEditTaskAsync(CurrentUserId, id))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Только Owner или Member могут изменять задачи.");
        }

        if (!await accessService.CanEditColumnAsync(CurrentUserId, taskDto.ColumnId))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Нельзя переместить задачу в чужую колонку.");
        }
        try
        {
            var updatedTask = await taskService.UpdateTaskAsync(id, taskDto);
            return Ok(updatedTask);
        }
        catch (DbUpdateConcurrencyException)
        {
            return StatusCode(StatusCodes.Status409Conflict, "Задача была изменена другим пользователем. Обновите страницу.");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        if (!await accessService.CanEditTaskAsync(CurrentUserId, id))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Только Owner или Member могут удалять задачи.");
        }
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