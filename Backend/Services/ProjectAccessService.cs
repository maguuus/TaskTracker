using Backend.Data;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ProjectAccessService(AppDbContext context) : IProjectAccessService
{
    public async Task<bool> CanViewProjectAsync(Guid userId, Guid projectId)
    {
        return await context.Projects
            .AnyAsync(p => p.Id == projectId && 
                           (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)));
    }

    public async Task<bool> CanViewColumnAsync(Guid userId, Guid columnId)
    {
        return await context.Columns
            .Where(c => c.Id == columnId)
            .AnyAsync(c => c.Project!.OwnerId == userId || 
                           c.Project!.Members.Any(m => m.UserId == userId));
    }

    public async Task<bool> CanEditProjectContentAsync(Guid userId, Guid projectId)
    {
        return await context.Projects
            .AnyAsync(p => p.Id == projectId && 
                           (p.OwnerId == userId || 
                            p.Members.Any(m => m.UserId == userId && m.Role != ProjectRole.Viewer)));
    }

    public async Task<bool> CanEditColumnAsync(Guid userId, Guid columnId)
    {
        return await context.Columns
            .Where(c => c.Id == columnId)
            .AnyAsync(c => c.Project!.OwnerId == userId || 
                           c.Project!.Members.Any(m => m.UserId == userId && m.Role != ProjectRole.Viewer));
    }

    public async Task<bool> CanEditTaskAsync(Guid userId, Guid taskId)
    {
        return await context.TaskItems
            .Where(t => t.Id == taskId)
            .AnyAsync(t => t.Column!.Project!.OwnerId == userId || 
                           t.Column!.Project!.Members.Any(m => m.UserId == userId && m.Role != ProjectRole.Viewer));
    }

    public async Task<bool> IsProjectOwnerAsync(Guid userId, Guid projectId)
    {
        return await context.Projects.AnyAsync(p => p.Id == projectId && p.OwnerId == userId);
    }

    public async Task<Guid?> GetProjectIdByColumnAsync(Guid columnId)
    {
        return await context.Columns
            .Where(c => c.Id == columnId)
            .Select(c => (Guid?)c.ProjectId)
            .FirstOrDefaultAsync();
    }

    public async Task<Guid?> GetProjectIdByTaskAsync(Guid taskId)
    {
        return await context.TaskItems
            .Where(t => t.Id == taskId)
            .Select(t => (Guid?)t.Column!.ProjectId)
            .FirstOrDefaultAsync();
    }
}