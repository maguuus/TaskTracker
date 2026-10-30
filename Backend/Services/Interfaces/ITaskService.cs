using Backend.DTO;

namespace Backend.Services.Interfaces;

public interface ITaskService
{
    Task<IEnumerable<TaskResponseDto>> GetTasksByColumnAsync(Guid columnId);
    Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto taskDto);
    Task<TaskResponseDto> UpdateTaskAsync(Guid id, TaskUpdateDto taskDto);
    Task<bool> DeleteTaskAsync(Guid id);
    Task<IEnumerable<TaskSearchResultDto>> SearchTasksAsync(Guid projectId, TaskSearchFilterDto filter);
    Task<TaskSearchResultDto?> GetRandomTaskAsync(Guid projectId, TaskSearchFilterDto filter);}