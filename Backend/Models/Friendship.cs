
namespace Backend.Models;

public class Friendship
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid FriendId { get; set; }
    public User Friend { get; set; } = null!;
}

