namespace TaskTracker.DTOs;
public class UserResponseDTO
{
    public Guid Id{get;set;}
    public string? Name{get;set;}
    public List<ProjectResponseDTO> Projects { get; set; }
    
}
