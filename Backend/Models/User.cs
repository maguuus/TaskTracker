namespace Backend.Models;

public class User
{
    public Guid Id{get;set;}
    public string Email{get;set;}
    public string PasswordHash{get;set;}
    public string Name{get;set;}
    public string? Avatar{get;set;}

    //// Навигационные свойства для связей
    public ICollection<Project>? OwnedProjects { get; set; }
    public ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();

    public ICollection<Friendship> SentFriendships { get; set; } = new List<Friendship>();

    public ICollection<Friendship> ReceivedFriendships { get; set; } = new List<Friendship>();

    public ICollection<ProjectInvitation> SentProjectInvitations { get; set; } = new List<ProjectInvitation>();

    public ICollection<ProjectInvitation> ReceivedProjectInvitations { get; set; } = new List<ProjectInvitation>();
}