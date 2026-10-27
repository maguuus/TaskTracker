namespace Backend.Services;
using Backend.DTO;
public interface IFriendshipService
{
    Task SendRequestAsync(Guid userId, Guid friendId);

    Task<List<FriendRequestDto>> GetIncomingRequestsAsync(Guid userId);

    Task AcceptRequestAsync(Guid userId, Guid requestId);

    Task RejectRequestAsync(Guid userId, Guid requestId);

    Task<List<FriendDto>> GetFriendsAsync(Guid userId);
    Task RemoveFriendAsync(Guid userId, Guid friendId);
}