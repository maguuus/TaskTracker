using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public class RealtimeNotifier(IHubContext<TaskTrackerHub> hubContext) : IRealtimeNotifier
{
    public Task NotifyProjectGroupAsync(Guid projectId, string entityType, string action, object payload)
    {
        var message = new
        {
            type = "stateChanged",
            entityType,
            action,
            payload,
            projectId,
            timestamp = DateTime.UtcNow
        };

        return hubContext.Clients.Group($"project-{projectId}").SendAsync("stateChanged", message);
    }

    public Task NotifyUserAsync(Guid userId, string entityType, string action, object payload)
    {
        var message = new
        {
            type = "stateChanged",
            entityType,
            action,
            payload,
            timestamp = DateTime.UtcNow
        };

        return hubContext.Clients.User(userId.ToString()).SendAsync("stateChanged", message);
    }

    public Task NotifyUsersAsync(IEnumerable<Guid> userIds, string entityType, string action, object payload)
    {
        var userStringIds = userIds.Select(u => u.ToString()).ToList();
        if (userStringIds.Count == 0) return Task.CompletedTask;

        var message = new
        {
            type = "stateChanged",
            entityType,
            action,
            payload,
            timestamp = DateTime.UtcNow
        };

        return hubContext.Clients.Users(userStringIds).SendAsync("stateChanged", message);
    }
}