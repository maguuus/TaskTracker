using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ProjectsController(AppDbContext context) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetProjectsByUser(Guid userId)
    {
        var projects = await context.Projects
            .Where(p => p.OwnerId == userId)
            .Select(p => new ProjectResponseDto(p.Id, p.Name, p.Id, p.CreatedAt, null))
            .ToListAsync();
        
        return Ok(projects);
    }
    
    [HttpPost]
    public async Task<ActionResult<ProjectResponseDto>> CreateProject(ProjectCreateDto projectDto)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = projectDto.Name,
            OwnerId = projectDto.OwnerId,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Projects.Add(project);
        await context.SaveChangesAsync();
        
        return Ok(new ProjectResponseDto(project.Id, project.Name, project.OwnerId, project.CreatedAt, null));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, ProjectUpdateDto projectDto)
    {
        var project = await context.Projects.FindAsync(id);
        if (project == null)
            return NotFound();
        
        project.Name = projectDto.Name;
        // project.Description = projectDto.Description - когда добавим Description
        
        await context.SaveChangesAsync();
        return NoContent();
    } 
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var projects = await context.Projects.FindAsync(id);
        if (projects == null)
            return NotFound();
        
        context.Projects.Remove(projects);
        await context.SaveChangesAsync();

        return NoContent();
    }
    
}