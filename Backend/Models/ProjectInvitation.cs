
namespace Backend.Models;

public class ProjectInvitation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid InviterId { get; set; }
    public User Inviter { get; set; } = null!;

    public Guid InviteeId { get; set; }
    public User Invitee { get; set; } = null!;

    public ProjectRole Role { get; set; } = ProjectRole.Member;

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
