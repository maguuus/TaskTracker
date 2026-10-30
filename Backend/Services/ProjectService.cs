using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ProjectService(AppDbContext context, IRealtimeNotifier realtimeNotifier) : IProjectService
{
    public async Task<IEnumerable<ProjectResponseDto>> GetProjectsByUserAsync(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("ID пользователя не может быть пустым.", nameof(userId));

        var userExists = await context.Users.AsNoTracking().AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw new InvalidOperationException("User not found.");

        return await context.Projects.AsNoTracking()
            .Where(p => p.OwnerId == userId || p.Members.Any(m => m.UserId == userId))
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectResponseDto(
                p.Id,
                p.Name,
                p.OwnerId,
                p.CreatedAt,
                p.Description,
                p.OwnerId == userId 
                    ? ProjectRole.Owner 
                    : p.Members.Where(m => m.UserId == userId).Select(m => m.Role).FirstOrDefault(),
                p.Cover
            ))
            .ToListAsync();
    }

    public async Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto projectDto)
    {
        var ownerId = projectDto.OwnerId
            ?? throw new InvalidOperationException("Project owner is required.");

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = projectDto.Name,
            Description = projectDto.Description,
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            Cover = projectDto.Cover ?? "abstract",
        };

        context.Projects.Add(project);
        context.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = ownerId,
            Role = ProjectRole.Owner
        });
        await context.SaveChangesAsync();

        var response = new ProjectResponseDto(
            project.Id,
            project.Name,
            project.OwnerId,
            project.CreatedAt,
            project.Description,
            ProjectRole.Owner,
            project.Cover);

        // Персональное уведомление создателю (чтобы синхронизировать открытые вкладки)
        await realtimeNotifier.NotifyUserAsync(project.OwnerId, "project", "created", new { project = response });

        return response;
    }

    public async Task<bool> UpdateProjectAsync(Guid id, ProjectUpdateDto projectDto)
    {
        var project = await context.Projects.FindAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found");

        project.Name = projectDto.Name;
        project.Description = projectDto.Description;
        project.Cover = projectDto.Cover;
        await context.SaveChangesAsync();

        var payload = new
        {
            id,
            name = project.Name,
            description = project.Description,
            ownerId = project.OwnerId,
            cover = project.Cover
        };

        var memberUserIds = await context.ProjectMembers
            .Where(pm => pm.ProjectId == id)
            .Select(pm => pm.UserId)
            .ToListAsync();

        await realtimeNotifier.NotifyUsersAsync(memberUserIds, "project", "updated", new { projectId = id, project = payload });

        await realtimeNotifier.NotifyProjectGroupAsync(id, "project", "updated", new { projectId = id, project = payload });

        return true;
    }
    public async Task<bool> DeleteProjectAsync(Guid id)
    {
        var project = await context.Projects.FindAsync(id);
        if (project == null)
            throw new InvalidOperationException("Project not found");

        var memberUserIds = await context.ProjectMembers
            .Where(pm => pm.ProjectId == id)
            .Select(pm => pm.UserId)
            .ToListAsync();

        context.Projects.Remove(project);
        await context.SaveChangesAsync();

        await realtimeNotifier.NotifyProjectGroupAsync(id, "project", "deleted", new { projectId = id });

        await realtimeNotifier.NotifyUsersAsync(memberUserIds, "project", "deleted", new { projectId = id });

        return true;
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
            .Select(pm => new ProjectMemberDto(pm.UserId, pm.UserId, pm.User!.Email, pm.User.Name, pm.Role, pm.User.Avatar))
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
            throw new InvalidOperationException("Нельзя назначить второго владельца. Выберите Member или Viewer.");

        var member = await context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == memberId);

        if (member == null)
            throw new InvalidOperationException("Участник не найден в проекте.");

        member.Role = dto.Role;
        await context.SaveChangesAsync();

        await realtimeNotifier.NotifyUserAsync(memberId, "projectMember", "updated", new { projectId, memberId, role = dto.Role });

        await realtimeNotifier.NotifyProjectGroupAsync(projectId, "projectMember", "updated", new { projectId, memberId, role = dto.Role });

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

        await realtimeNotifier.NotifyUserAsync(memberId, "projectMember", "deleted", new { projectId, memberId, userId = memberId });

        await realtimeNotifier.NotifyProjectGroupAsync(projectId, "projectMember", "deleted", new { projectId, memberId, userId = memberId });

        return true;
    }

    public async Task<ProjectInvitationResponseDto> CreateInvitationAsync(Guid projectId, Guid currentUserId, CreateProjectInvitationDto dto)
    {
        if (projectId == Guid.Empty || currentUserId == Guid.Empty)
            throw new ArgumentException("ID проекта и пользователя обязательны.");

        if (dto is null || string.IsNullOrWhiteSpace(dto.Name))
            throw new InvalidOperationException("Укажите имя пользователя.");

        var project = await context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project is null)
            throw new InvalidOperationException("Проект не найден.");

        if (project.OwnerId != currentUserId)
            throw new UnauthorizedAccessException(
                "Только владелец проекта может приглашать участников.");

        if (dto.Role == ProjectRole.Owner)
            throw new InvalidOperationException(
                "Нельзя назначить второго владельца.");

        var name = dto.Name.Trim();

        var invitee = await context.Users
            .FirstOrDefaultAsync(u => u.Name.ToLower() == name.ToLower());

        if (invitee is null)
            throw new InvalidOperationException("Пользователь не найден.");

        if (invitee.Id == currentUserId)
            throw new InvalidOperationException("Нельзя пригласить самого себя.");

        var isMember = await context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == projectId &&
                            pm.UserId == invitee.Id);

        if (isMember)
            throw new InvalidOperationException(
                "Пользователь уже состоит в проекте.");

        var hasPendingInvitation = await context.ProjectInvitations
            .AnyAsync(i => i.ProjectId == projectId &&
                        i.InviteeId == invitee.Id &&
                        i.Status == "Pending");

        if (hasPendingInvitation)
            throw new InvalidOperationException(
                "Приглашение этому пользователю уже отправлено.");

        var invitation = new ProjectInvitation
        {
            ProjectId = projectId,
            InviterId = currentUserId,
            InviteeId = invitee.Id,
            Role = dto.Role,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        context.ProjectInvitations.Add(invitation);
        await context.SaveChangesAsync();

        return new ProjectInvitationResponseDto(
            invitation.Id,
            project.Id,
            project.Name,
            currentUserId,
            (await context.Users
                .Where(u => u.Id == currentUserId)
                .Select(u => u.Name)
                .FirstAsync()),
            invitee.Id,
            invitee.Name,
            invitation.Role,
            invitation.Status,
            invitation.CreatedAt);
    }

    public async Task<IEnumerable<ProjectInvitationResponseDto>> GetMyInvitationsAsync(Guid currentUserId)
    {
        return await context.ProjectInvitations
            .AsNoTracking()
            .Where(i => i.InviteeId == currentUserId &&
                        i.Status == "Pending")
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new ProjectInvitationResponseDto(
                i.Id,
                i.ProjectId,
                i.Project.Name,
                i.InviterId,
                i.Inviter.Name,
                i.InviteeId,
                i.Invitee.Name,
                i.Role,
                i.Status,
                i.CreatedAt))
            .ToListAsync();
    }

    public async Task<bool> RespondToInvitationAsync(Guid invitationId, Guid currentUserId, bool accept)
    {
        var invitation = await context.ProjectInvitations
            .FirstOrDefaultAsync(i =>
                i.Id == invitationId &&
                i.InviteeId == currentUserId);

        if (invitation is null)
            throw new InvalidOperationException(
                "Приглашение не найдено.");

        if (invitation.Status != "Pending")
            throw new InvalidOperationException(
                "Это приглашение уже обработано.");

        if (accept)
        {
            var alreadyMember = await context.ProjectMembers
                .AnyAsync(pm =>
                    pm.ProjectId == invitation.ProjectId &&
                    pm.UserId == currentUserId);

            if (!alreadyMember)
            {
                context.ProjectMembers.Add(new ProjectMember
                {
                    ProjectId = invitation.ProjectId,
                    UserId = currentUserId,
                    Role = invitation.Role
                });
            }

            invitation.Status = "Accepted";
        }
        else
        {
            invitation.Status = "Rejected";
        }

        await context.SaveChangesAsync();

        if (accept)
        {
            var payload = new
            {
                projectId = invitation.ProjectId,
                userId = currentUserId
            };

            await realtimeNotifier.NotifyUserAsync(
                currentUserId,
                "projectMember",
                "created",
                payload);

            await realtimeNotifier.NotifyProjectGroupAsync(
                invitation.ProjectId,
                "projectMember",
                "created",
                payload);
        }

        return true;
    }
}