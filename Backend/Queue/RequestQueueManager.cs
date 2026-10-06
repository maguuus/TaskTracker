using Backend.Services;
namespace Backend.Queue;

public class RequestQueueManager
{
    private readonly Dictionary<Guid, RequestQueue> _queues = new();
    private readonly object _lock = new();
    private readonly IRealtimeNotifier _notifier;
    private readonly IHostApplicationLifetime _applicationLifetime;

    public RequestQueueManager(IRealtimeNotifier notifier, IHostApplicationLifetime applicationLifetime)
    {
        _notifier = notifier;
        _applicationLifetime = applicationLifetime;
    }

    private RequestQueue GetQueue(Guid projectId)
    {
        lock (_lock)
        {
            if (_queues.TryGetValue(projectId, out var queue))
                return queue;
            queue = new RequestQueue(projectId, _notifier);
            _queues[projectId] = queue;
            _ = queue.ProcessRequests(_applicationLifetime.ApplicationStopping);
            return queue;
        }
    }
    public Task<T> EnqueueRequest<T>(Guid projectId, string connectionId, string entityType, string action, long version, Guid? currentUserId, Func<Task<T>> requestAction, Func<T, long, T> setVersion)
    {
        return GetQueue(projectId).EnqueueRequest(connectionId, entityType, action, version, currentUserId, requestAction, setVersion);
    }
    public long GetCurrentVersion(Guid projectId)
    {
        return GetQueue(projectId).CurrentVersion;
    }
}