namespace Backend.Services;
using Backend.DTO;
public interface IFriendshipService
{
    Task AddFavoriteAsync(Guid userId, Guid friendId);

    Task<List<FriendDto>> GetFavoritesAsync(Guid userId);

    Task RemoveFavoriteAsync(Guid userId, Guid friendId);
}