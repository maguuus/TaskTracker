namespace Backend.Services;

public interface IRealtimeNotifier
{
    Task NotifyUserAsync(Guid userId, string entityType, string action, object payload);
    Task NotifyUsersAsync(IEnumerable<Guid> userIds, string entityType, string action, object payload);
    Task NotifyProjectGroupAsync(Guid projectId, string entityType, string action, object payload, string? ConnectionId = null);
    Task NotifyErrorAsync(string connectionId, string message);
    void RemoveConnection(string connectionId);
}