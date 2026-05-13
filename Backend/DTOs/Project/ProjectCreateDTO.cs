namespace TaskTracker.DTOs;

public class ProjectCreateDTO
{
        public string Name { get; set; }
        public int OwnerId { get; set; }
        public int? OrderIndex { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Description { get; set; }
        public string? Title { get; set; }

}