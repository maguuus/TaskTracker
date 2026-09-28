using Backend.DTO;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class ProjectService(AppDbContext context) : IProjectService
{
    public async Task<IEnumerable<ProjectResponseDto>> GetProjectsByUserAsync(Guid userId)
    {
        return await context.Projects
            .Where(p => p.OwnerId == userId || p.Members.Any(m => m.UserId == userId))
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectResponseDto(p.Id, p.Name, p.OwnerId, p.CreatedAt, p.Description, p.OwnerId == userId 
                    ? ProjectRole.Owner 
                    : (p.Members.Where(m => m.UserId == userId).Select(m => m.Role).FirstOrDefault())
            ))
            .ToListAsync();    
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
            Role = ProjectRole.Owner
        });
        await context.SaveChangesAsync();
        return new ProjectResponseDto(project.Id, project.Name, project.OwnerId, project.CreatedAt, project.Description, ProjectRole.Owner);
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
        var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        if (project == null)
            throw new InvalidOperationException("Проект не найден.");

        if (project.OwnerId != currentUserId)
            throw new UnauthorizedAccessException("Только владелец проекта может добавлять участников.");

        if (dto.Role == ProjectRole.Owner)
            throw new InvalidOperationException("Нельзя назначить второго владельца. Выберите Member или Viewer.");

        var normalizedEmail = dto.Email.Trim().ToLower();
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user == null)
            throw new InvalidOperationException("Пользователь с такой почтой не найден.");

        if (user.Id == project.OwnerId)
            throw new InvalidOperationException("Владелец уже состоит в проекте.");

        var isAlreadyMember = await context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id);
            
        if (isAlreadyMember)
            throw new InvalidOperationException("Пользователь уже является участником проекта.");

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = user.Id,
            Role = dto.Role
        };

        context.ProjectMembers.Add(member);
        await context.SaveChangesAsync();

        return new ProjectMemberDto(user.Id, user.Id, user.Email, user.Name, member.Role);
    }

    public async Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(Guid projectId, Guid currentUserId)
    {
        var hasAccess = await context.Projects
            .AnyAsync(p => p.Id == projectId && 
                          (p.OwnerId == currentUserId || p.Members.Any(m => m.UserId == currentUserId)));

        if (!hasAccess)
            throw new UnauthorizedAccessException("У вас нет доступа к участникам этого проекта.");

        return await context.ProjectMembers
            .Where(pm => pm.ProjectId == projectId)
            .OrderBy(pm => pm.Role == ProjectRole.Owner ? 0 : pm.Role == ProjectRole.Member ? 1 : 2)
            .Select(pm => new ProjectMemberDto(pm.UserId, pm.UserId, pm.User!.Email, pm.User.Name, pm.Role))
            .ToListAsync();
    }

    public async Task<bool> UpdateMemberRoleAsync(Guid projectId, Guid currentUserId, Guid memberId, UpdateMemberRoleDto dto)
    {
        var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        if (project == null)
            throw new InvalidOperationException("Проект не найден.");

        if (project.OwnerId != currentUserId)
            throw new UnauthorizedAccessException("Только владелец проекта может изменять роли.");

        if (memberId == project.OwnerId)
            throw new InvalidOperationException("Роль владельца нельзя изменить.");

        if (dto.Role == ProjectRole.Owner)
            throw new InvalidOperationException("Нельзя назначить второго владельца. Выберите Editor или Viewer.");

        var member = await context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == memberId);

        if (member == null)
            throw new InvalidOperationException("Участник не найден в проекте.");

        member.Role = dto.Role;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberAsync(Guid projectId, Guid currentUserId, Guid memberId)
    {
        var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        if (project == null)
            throw new InvalidOperationException("Проект не найден.");

        var isOwner = project.OwnerId == currentUserId;
        var isSelf = currentUserId == memberId;

        if (!isOwner && !isSelf)
            throw new UnauthorizedAccessException("Недостаточно прав для удаления этого участника.");

        if (memberId == project.OwnerId)
            throw new InvalidOperationException("Нельзя удалить владельца проекта.");

        var member = await context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == memberId);

        if (member == null)
            throw new InvalidOperationException("Участник не найден в проекте.");

        context.ProjectMembers.Remove(member);
        await context.SaveChangesAsync();
        return true;
    }
}