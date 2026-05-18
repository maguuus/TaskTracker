using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetProjectsByUser(Guid userId)
    {
        var projects = await projectService.GetProjectsByUserAsync(userId);      
        return Ok(projects);
    }
    
    [HttpPost]
    public async Task<ActionResult<ProjectResponseDto>> CreateProject(ProjectCreateDto projectDto)
    {
        var projectResponseDto = await projectService.CreateProjectAsync(projectDto);
            
        return Ok(projectResponseDto);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, ProjectUpdateDto projectDto)
    {
        try
        {
            await projectService.UpdateProjectAsync(id, projectDto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    } 
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        try
        {
            await projectService.DeleteProjectAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound();
        }
    }
    
}