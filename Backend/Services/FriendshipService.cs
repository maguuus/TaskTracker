using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class FriendshipService(AppDbContext context) : IFriendshipService
{
    public async Task SendRequestAsync(Guid userId, Guid friendId)
    {
        if (userId == friendId)
            throw new InvalidOperationException(
                "Нельзя добавить самого себя в друзья.");

        var friendExists = await context.Users
            .AnyAsync(u => u.Id == friendId);

        if (!friendExists)
            throw new KeyNotFoundException("Пользователь не найден.");

        var existing = await context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.UserId == userId && f.FriendId == friendId) ||
                (f.UserId == friendId && f.FriendId == userId));

        if (existing is not null)
        {
            if (existing.Status == FriendshipStatus.Accepted)
                throw new InvalidOperationException(
                    "Вы уже друзья.");

            throw new InvalidOperationException(
                "Заявка между этими пользователями уже существует.");
        }

        var friendship = new Friendship
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FriendId = friendId,
            Status = FriendshipStatus.Pending
        };

        context.Friendships.Add(friendship);
        await context.SaveChangesAsync();
    }
}