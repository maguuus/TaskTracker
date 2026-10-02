using Backend.DTO;

namespace Backend.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectResponseDto>> GetProjectsByUserAsync(Guid userId);
    Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto projectDto);
    Task<bool> UpdateProjectAsync(Guid id, ProjectUpdateDto projectDto);
    Task<bool> DeleteProjectAsync(Guid id);
    Task<ProjectMemberDto> AddMemberAsync(Guid projectId, Guid currentUserId, AddProjectMemberDto dto);
    Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(Guid projectId, Guid currentUserId);
    Task<bool> UpdateMemberRoleAsync(Guid projectId, Guid currentUserId, Guid memberId, UpdateMemberRoleDto dto);
    Task<bool> RemoveMemberAsync(Guid projectId, Guid currentUserId, Guid memberId);
}