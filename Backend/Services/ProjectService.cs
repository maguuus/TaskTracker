using Backend.DTO;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class ProjectService(AppDbContext context) : IProjectService
{
    public async Task<IEnumerable<ProjectResponseDto>> GetProjectsByUserAsync(Guid userId)
    {
        var projects = await context.Projects
            .Where(p => p.OwnerId == userId ||
                p.Members.Any(m => m.UserId == userId))
            .Select(p => new ProjectResponseDto(p.Id, p.Name, p.OwnerId, p.CreatedAt, p.Description))
            .ToListAsync();
        
        return projects;
    }
    public async Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto projectDto)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = projectDto.Name,
            Description = projectDto.Description,
            OwnerId = projectDto.OwnerId,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Projects.Add(project);
        context.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = project.OwnerId,
            Role = "Owner"
        });
        await context.SaveChangesAsync();
        return new ProjectResponseDto(project.Id, project.Name, project.OwnerId, project.CreatedAt, project.Description);
    }
    public async Task<bool> UpdateProjectAsync(Guid id, ProjectUpdateDto projectDto)
    {
        var project = await context.Projects.FindAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found");
        
        project.Name = projectDto.Name;
        project.Description = projectDto.Description;
        
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

    public async Task<ProjectMemberDto> AddMemberAsync(Guid projectId, Guid currentUserId, AddProjectMemberDto dto)
    {
        var project = await context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new InvalidOperationException("Project not found");

        if (project.OwnerId != currentUserId)
            throw new UnauthorizedAccessException("Only the project owner can add members.");

        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
            throw new InvalidOperationException("User not found");

        if (project.Members.Any(m => m.UserId == user.Id))
            throw new InvalidOperationException("User is already a member of the project");

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = user.Id,
            Role = "Member"
        };

        context.ProjectMembers.Add(member);
        await context.SaveChangesAsync();

        return new ProjectMemberDto(user.Id, user.Email, user.Name, member.Role);
    }

    public async Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(Guid projectId, Guid currentUserId)
    {
        var hasAccess = await context.Projects
            .AnyAsync(p => p.Id == projectId && (p.OwnerId == currentUserId || p.Members.Any(m => m.UserId == currentUserId)));
        if (!hasAccess)
            throw new UnauthorizedAccessException("You are not a member of this project.");

        return await context.ProjectMembers 
        .Where(pm => pm.ProjectId == projectId)
        .Select(pm => new ProjectMemberDto(pm.UserId, pm.User.Email, pm.User.Name, pm.Role))
        .ToListAsync();
    }

    public async Task<bool> RemoveMemberAsync(Guid projectId, Guid currentUserId, Guid memberId)
    {
        var project = await context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new InvalidOperationException("Project not found");

        if (project.OwnerId != currentUserId)
            throw new UnauthorizedAccessException("Only the project owner can remove members.");

        var member = await context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == memberId);

        if (member == null)
            throw new InvalidOperationException("Member not found in the project");

        context.ProjectMembers.Remove(member);
        await context.SaveChangesAsync();

        return true;
    }
}