namespace TaskTracker.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? Priority { get; set; }
        public string? Urgency { get; set; }
        
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? PlannedStartAt { get; set; }
        
        public int OrderIndex { get; set; }

        public Guid ColumnId { get; set; }

        // Навигационные свойства для связей
        public Column Column { get; set; }
    }
}