namespace TaskTracker.DTOs;

public class ProjectResponseDTO
{
        public Guid Id { get; set; }
        public string Name { get; set; }
        public (int id, string Name) owner { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Description { get; set; }
        public string Title { get; set; }
}