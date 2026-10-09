namespace Backend.Services;

public interface IRealtimeNotifier
{
    Task NotifyStateChangedAsync(string entityType, string action, object payload, Guid? currentUserId = null);
    Task NotifyProjectStateChangedAsync(Guid projectId, string entityType, string action, object payload, Guid? currentUserId = null);
    Task NotifyErrorAsync(string connectionId, string message);
}