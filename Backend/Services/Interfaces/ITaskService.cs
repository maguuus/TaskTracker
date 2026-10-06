using Backend.DTO;

namespace Backend.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskResponseDto>> GetTasksByColumnAsync(Guid columnId);
    Task<TaskResponseDto> CreateTaskAsync(TaskCreateDto taskDto);
    Task<TaskResponseDto> UpdateTaskAsync(Guid id, TaskUpdateDto taskDto);
    Task<bool> DeleteTaskAsync(Guid id);
}