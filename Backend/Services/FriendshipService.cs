using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Backend.DTO;

namespace Backend.Services;

public class FriendshipService(AppDbContext context) : IFriendshipService
{
    public async Task AddFavoriteAsync(Guid userId, Guid friendId)
    {
        if (userId == friendId)
            throw new InvalidOperationException(
                "Нельзя добавить самого себя в избранное.");

        var friendExists = await context.Users
            .AnyAsync(u => u.Id == friendId);

        if (!friendExists)
            throw new KeyNotFoundException("Пользователь не найден в избранном.");

        var existing = await context.Friendships
            .FirstOrDefaultAsync(f => f.UserId == userId && f.FriendId == friendId);

        if (existing is not null)
            throw new InvalidOperationException("Пользователь уже в избранном.");

        var friendship = new Friendship
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FriendId = friendId,
        };

        context.Friendships.Add(friendship);
        await context.SaveChangesAsync();
    }
    

    
    public async Task<List<FriendDto>> GetFavoritesAsync(Guid userId)
    {
        return await context.Friendships
            .Where(f => f.UserId == userId)
            .Select(f => new FriendDto(
                f.FriendId,
                f.Friend.Name,
                f.Friend.Email,
                f.Friend.Avatar))
            .ToListAsync();
    }

    public async Task RemoveFavoriteAsync(Guid userId, Guid friendId)
    {
        var friendship = await context.Friendships
            .FirstOrDefaultAsync(f =>
                f.UserId == userId &&
                f.FriendId == friendId);

        if (friendship is null)
            throw new KeyNotFoundException("Друг не найден.");

        context.Friendships.Remove(friendship);
        await context.SaveChangesAsync();
    }
}