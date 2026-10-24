namespace Backend.Services;

public interface IFriendshipService
{
    Task SendRequestAsync(Guid userId, Guid friendId);
}