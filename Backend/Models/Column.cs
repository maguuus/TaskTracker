namespace TaskTracker.Models
{
    public class Column
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public int OrderIndex { get; set; }
        public Guid ProjectId { get; set; }

        // Навигационные свойства для связей
        public Project Project { get; set; }
        public ICollection<TaskItem> TaskItems { get; set; }
    }
}