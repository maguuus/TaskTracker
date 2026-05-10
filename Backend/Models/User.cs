namespace TaskTracker.Models
{
    public class User
    {
        public Guid Id{get;set;}
        public string Email{get;set;}
        public string PasswordHash{get;set;}
        public string Name{get;set;}
        //// Навигационные свойства для связей
        public ICollection<Project> OwnedProjects { get; set; }
    }
}