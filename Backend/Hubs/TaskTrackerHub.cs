using System.Security.Claims;
using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Hubs;

[Authorize]
public class TaskTrackerHub(AppDbContext dbContext) : Hub
{
    public async Task JoinProject(Guid projectId)
    {
        var rawUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? Context.User?.FindFirst("sub")?.Value;

        if (Guid.TryParse(rawUserId, out var userId))
        {
            var hasAccess = await dbContext.Projects
                .AsNoTracking()
                .AnyAsync(p => p.Id == projectId && 
                               (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)));

            if (!hasAccess)
            {
                throw new HubException("У вас нет доступа к этому проекту.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"project-{projectId}");
        }
    }

    public async Task LeaveProject(Guid projectId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"project-{projectId}");
    }
}