using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Backend.DTO;

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
    
    public async Task<List<FriendRequestDto>> GetIncomingRequestsAsync(Guid userId)
    {
        return await context.Friendships
            .Where(f =>
                f.FriendId == userId &&
                f.Status == FriendshipStatus.Pending)
            .Select(f => new FriendRequestDto(
                f.Id,
                f.UserId,
                f.User.Name))
            .ToListAsync();
    }

    public async Task AcceptRequestAsync(Guid userId, Guid requestId)
    {
        var request = await context.Friendships.FirstOrDefaultAsync(f =>
            f.Id == requestId &&
            f.FriendId == userId &&
            f.Status == FriendshipStatus.Pending);

        if (request is null)
            throw new KeyNotFoundException("Входящая заявка не найдена.");

        request.Status = FriendshipStatus.Accepted;

        await context.SaveChangesAsync();
    }

    public async Task RejectRequestAsync(Guid userId, Guid requestId)
    {
        var request = await context.Friendships.FirstOrDefaultAsync(f =>
            f.Id == requestId &&
            f.FriendId == userId &&
            f.Status == FriendshipStatus.Pending);

        if (request is null)
            throw new KeyNotFoundException("Входящая заявка не найдена.");

        context.Friendships.Remove(request);

        await context.SaveChangesAsync();
    }

    
    public async Task<List<FriendDto>> GetFriendsAsync(Guid userId)
    {
        return await context.Friendships
            .Where(f =>
                f.Status == FriendshipStatus.Accepted &&
                (f.UserId == userId || f.FriendId == userId))
            .Select(f => new FriendDto(
                f.UserId == userId ? f.FriendId : f.UserId,
                f.UserId == userId ? f.Friend.Name : f.User.Name))
            .ToListAsync();
    }

    public async Task RemoveFriendAsync(Guid userId, Guid friendId)
    {
        var friendship = await context.Friendships
            .FirstOrDefaultAsync(f =>
                f.Status == FriendshipStatus.Accepted &&
                (
                    (f.UserId == userId && f.FriendId == friendId) ||
                    (f.UserId == friendId && f.FriendId == userId)
                ));

        if (friendship is null)
            throw new KeyNotFoundException("Друг не найден.");

        context.Friendships.Remove(friendship);
        await context.SaveChangesAsync();
    }
}