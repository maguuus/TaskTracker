namespace Backend.Services.Interfaces;

public interface IProjectAccessService
{
    Task<bool> CanViewProjectAsync(Guid userId, Guid projectId);
    Task<bool> CanViewColumnAsync(Guid userId, Guid columnId);
    Task<bool> CanEditProjectContentAsync(Guid userId, Guid projectId);
    Task<bool> CanEditColumnAsync(Guid userId, Guid columnId);
    Task<bool> CanEditTaskAsync(Guid userId, Guid taskId);
    Task<bool> IsProjectOwnerAsync(Guid userId, Guid projectId);
}