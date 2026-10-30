using Backend.DTO;

namespace Backend.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectResponseDto>> GetProjectsByUserAsync(Guid userId);
    Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto projectDto);
    Task<bool> UpdateProjectAsync(Guid id, ProjectUpdateDto projectDto);
    Task<bool> DeleteProjectAsync(Guid id);
    Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(Guid projectId, Guid currentUserId);
    Task<bool> UpdateMemberRoleAsync(Guid projectId, Guid currentUserId, Guid memberId, UpdateMemberRoleDto dto);
    Task<bool> RemoveMemberAsync(Guid projectId, Guid currentUserId, Guid memberId);

    Task<ProjectInvitationResponseDto> CreateInvitationAsync(Guid projectId, Guid currentUserId, CreateProjectInvitationDto dto);

    Task<IEnumerable<ProjectInvitationResponseDto>> GetMyInvitationsAsync(Guid currentUserId);

    Task<bool> RespondToInvitationAsync(Guid invitationId, Guid currentUserId,bool accept);
}