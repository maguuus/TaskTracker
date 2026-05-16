using Backend.DTO;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class ProjectService: IProjectService
{
    private readonly AppDbContext context;
    public ProjectService(AppDbContext context)
    {
        this.context = context;
    }

    public async Task<IEnumerable<ProjectResponseDto>> GetProjectsByUserAsync(Guid userId)
    {
        var projects = await context.Projects
            .Where(p => p.OwnerId == userId)
            .Select(p => new ProjectResponseDto(p.Id, p.Name, p.Id, p.CreatedAt, null))
            .ToListAsync();
        
        return projects;
    }
    public async Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto projectDto)
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
        return new ProjectResponseDto(project.Id, project.Name, project.OwnerId, project.CreatedAt, null);
    }
    public async Task<bool> UpdateProjectAsync(Guid id, ProjectUpdateDto projectDto)
    {
        var project = await context.Projects.FindAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found");
        
        project.Name = projectDto.Name;
        // project.Description = projectDto.Description - когда добавим Description
        
        await context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> DeleteProjectAsync(Guid id)
    {
        var project = await context.Projects.FindAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found");
        
        context.Projects.Remove(project);
        await context.SaveChangesAsync();

        return true;
    }
}