namespace TaskTracker.Models
{
    public class Project
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Description { get; set; }
        public string Title { get; set; }

        // Навигационные свойства для связей
        public ICollection<Column> Columns { get; set; }
        public User Owner { get; set; }
    }
}