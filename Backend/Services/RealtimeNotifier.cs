using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public class RealtimeNotifier(IHubContext<TaskTrackerHub> hubContext) : IRealtimeNotifier
{
    public Task NotifyStateChangedAsync(string entityType, string action, object payload)
    {
        var message = new
        {
            type = "stateChanged",
            entityType,
            action,
            payload,
            timestamp = DateTime.UtcNow
        };

        return hubContext.Clients.All.SendAsync("stateChanged", message);
    }

    public Task NotifyProjectStateChangedAsync(Guid projectId, string entityType, string action, object payload)
    {
        var message = new
        {
            type = "stateChanged",
            entityType,
            action,
            payload,
            timestamp = DateTime.UtcNow
        };

        return hubContext.Clients.Group($"project-{projectId}").SendAsync("stateChanged", message);
    }
}
