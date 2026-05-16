using Backend.DTO;

namespace Backend.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectResponseDto>> GetProjectsByUserAsync(Guid projectId);
    Task<ProjectResponseDto> CreateProjectAsync(ProjectCreateDto projectDto);
    Task<bool> UpdateProjectAsync(Guid id, ProjectUpdateDto projectDto);
    Task<bool> DeleteProjectAsync(Guid id);
}