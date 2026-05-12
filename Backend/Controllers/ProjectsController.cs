using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ProjectsController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        return await context.Projects.ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var projects = await context.Projects.FindAsync(id);

        if (projects == null)
        {
            return NotFound();
        }
        
        return projects;
    }

    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject(Project project)
    {
        context.Projects.Add(project);
        await context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var projects = await context.Projects.FindAsync(id);
        if (projects == null)
        {
            return NotFound();
        }
        context.Projects.Remove(projects);
        await context.SaveChangesAsync();

        return NoContent();
    }
}