using Backend.DTO;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class ColumnService: IColumnService
{
    private readonly AppDbContext context;
    public ColumnService(AppDbContext context)
    {
        this.context = context;
    }
    public async Task<IEnumerable<ColumnResponseDto>> GetColumnsByProjectAsync(Guid projectId)
    {
        var columns = await context.Columns
            .Where(c => c.ProjectId == projectId)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new ColumnResponseDto(c.Id, c.Title, c.OrderIndex, c.ProjectId))
            .ToListAsync();
        return columns;
    }
    public async Task<ColumnResponseDto> CreateColumnAsync(ColumnCreateDto columnDto)
    {
        if (!await context.Projects.AnyAsync(p => p.Id == columnDto.ProjectId))
            throw new InvalidOperationException("Project not found");

        var column = new Column
        {
            Id = Guid.NewGuid(),
            Title = string.IsNullOrWhiteSpace(columnDto.Title) ? "" : columnDto.Title,
            OrderIndex = columnDto.OrderIndex,
            ProjectId = columnDto.ProjectId
        };
        
        context.Columns.Add(column);
        await context.SaveChangesAsync();

        return new ColumnResponseDto(column.Id, column.Title, column.OrderIndex, column.ProjectId);
    }
    public async Task<bool> UpdateColumnAsync(Guid id, ColumnUpdateDto columnDto)
    {
        var column = await context.Columns.FindAsync(id);
        if (column == null)
            throw new InvalidOperationException("Column not found");
        
        column.Title = columnDto.Title;
        column.OrderIndex = columnDto.OrderIndex;
        await context.SaveChangesAsync();
        return true;
    }
    public async Task<bool> DeleteColumnAsync(Guid id)
    {
        var column = await context.Columns.FindAsync(id);
        if (column == null)
            throw new InvalidOperationException();

        context.Columns.Remove(column);
        await context.SaveChangesAsync();

        return true;
    }
}