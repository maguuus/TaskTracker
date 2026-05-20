using Backend.DTO;

namespace Backend.Services;

public interface IColumnService
{
    Task<IEnumerable<ColumnResponseDto>> GetColumnsByProjectAsync(Guid projectId);
    Task<ColumnResponseDto> CreateColumnAsync(ColumnCreateDto columnDto);
    Task<bool> UpdateColumnAsync(Guid id, ColumnUpdateDto columnDto);
    Task<bool> DeleteColumnAsync(Guid id);
}