using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Channels;
namespace Backend.Services;

public class RealtimeNotifier(IHubContext<TaskTrackerHub> hubContext, IHostApplicationLifetime applicationLifetime) : IRealtimeNotifier
{
    private record Notification(string EventName, object Payload);
    private readonly ConcurrentDictionary<string, Channel<Notification>> connectionQueues = new();
    
    private Channel<Notification> GetQueue(string connectionId)
    {
        if (connectionQueues.TryGetValue(connectionId, out var queue))
            return queue;
        var newQueue = Channel.CreateUnbounded<Notification>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });
        if (connectionQueues.TryAdd(connectionId, newQueue))
        {
            _ = ProcessQueue(connectionId, newQueue);
            return newQueue;
        }
        return connectionQueues[connectionId];
    }
    private void Enqueue(string connectionId, string eventName, object payload)
    {
        var queue = GetQueue(connectionId);
        queue.Writer.TryWrite(new Notification(eventName, payload));
    }

    private async Task ProcessQueue(string connectionId, Channel<Notification> queue)
    {
        try
        {
            await foreach (var notification in queue.Reader.ReadAllAsync(applicationLifetime.ApplicationStopping))
            {
                try
                {
                    await hubContext.Clients.Client(connectionId).SendAsync(notification.EventName, notification.Payload);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Notifier error: {ex.Message}");
                }
            }
        }
        catch (OperationCanceledException) {}
    }

    public Task NotifyErrorAsync(string connectionId, string message)
    {
        var error = new
        {
            type = "error",
            message,
            timestamp = DateTime.UtcNow
        };
        Enqueue(connectionId, "error", error);
        return Task.CompletedTask;
    }
    public void RemoveConnection(string connectionId)
    {
        if (connectionQueues.TryRemove(connectionId, out var queue))
            queue.Writer.TryComplete();
    }
    public Task NotifyProjectGroupAsync(Guid projectId, string entityType, string action, object payload,  string? ConnectoinId = null)
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
        foreach (var connectionId in TaskTrackerHub.GetConnectionIdsForProject(projectId))
        {
            if (connectionId != ConnectoinId)
                Enqueue(connectionId, "stateChanged", message);
        }

        return Task.CompletedTask;
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

        foreach (var connectionId in TaskTrackerHub.GetConnectionIdsForUser(userId.ToString()))
            Enqueue(connectionId, "stateChanged", message);

        return Task.CompletedTask;
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
        var connectionIds = userIds.SelectMany(userId => TaskTrackerHub.GetConnectionIdsForUser(userId.ToString())).Distinct();
        foreach (var connectionId in connectionIds)
            Enqueue(connectionId, "stateChanged", message);

        return Task.CompletedTask;
    }
}