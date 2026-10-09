using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public class RealtimeNotifier(IHubContext<TaskTrackerHub> hubContext) : IRealtimeNotifier
{
    public Task NotifyErrorAsync(string connectionId, string message)
    {
        var error = new
        {
            type = "error",
            message,
            timestamp = DateTime.UtcNow
        };

        return hubContext.Clients.Client(connectionId).SendAsync("error", error);
    }

    public Task NotifyStateChangedAsync(string entityType, string action, object payload, Guid? currentUserId = null)
    {
        var message = new
        {
            type = "stateChanged",
            entityType,
            action,
            payload,
            timestamp = DateTime.UtcNow
        };

        if (currentUserId is Guid userId)
        {
            var excludedConnectionIds = TaskTrackerHub.GetConnectionIdsForUser(userId.ToString()).ToList();
            if (excludedConnectionIds.Count > 0)
            {
                return hubContext.Clients.AllExcept(excludedConnectionIds).SendAsync("stateChanged", message);
            }
        }

        return hubContext.Clients.All.SendAsync("stateChanged", message);
    }

    public Task NotifyProjectStateChangedAsync(Guid projectId, string entityType, string action, object payload, Guid? currentUserId = null)
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

        var groupName = $"project-{projectId}";
        if (currentUserId is Guid userId)
        {
            var excludedConnectionIds = TaskTrackerHub.GetConnectionIdsForUser(userId.ToString()).ToList();
            if (excludedConnectionIds.Count > 0)
            {
                return hubContext.Clients.GroupExcept(groupName, excludedConnectionIds).SendAsync("stateChanged", message);
            }
        }

        return hubContext.Clients.Group(groupName).SendAsync("stateChanged", message);
    }
}