namespace TaskTracker.DTOs;
using Models;
public class ColumnResponseDTO
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public int OrderIndex { get; set; }
    public List<TaskResponseDTO> Tasks { get; set; }

}
