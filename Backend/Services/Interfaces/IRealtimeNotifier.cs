namespace Backend.Services;

public interface IRealtimeNotifier
{
    Task NotifyStateChangedAsync(string entityType, string action, object payload);
    Task NotifyProjectStateChangedAsync(Guid projectId, string entityType, string action, object payload);
}
