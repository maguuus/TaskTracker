namespace Backend.Services;

public interface IRealtimeNotifier
{
    Task NotifyProjectGroupAsync(Guid projectId, string entityType, string action, object payload);
    Task NotifyUserAsync(Guid userId, string entityType, string action, object payload);

    Task NotifyUsersAsync(IEnumerable<Guid> userIds, string entityType, string action, object payload);
}