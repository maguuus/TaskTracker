using System.Threading.Channels;
using Backend.Services;

namespace Backend.Queue;


public interface IQueuedRequest
{
    string ConnectionId { get; }
    string EntityType { get; }
    string Action { get; }
    object? Result { get; }
    Guid? CurrentUserId { get; }
    Task ExecuteAsync(long newVersion);
    void Complete();
    void SetException(Exception exception);
    long Version { get; }
}


public class QueuedRequest<T> : IQueuedRequest
{
    public string ConnectionId { get; }
    public string EntityType { get; }
    public string Action { get; }
    public long Version { get; }
    public Guid? CurrentUserId { get; }
    private readonly Func<T, long, T> _setVersion;
    private readonly Func<Task<T>> _action;
    private readonly TaskCompletionSource<T> _completionSource =
        new(TaskCreationOptions.RunContinuationsAsynchronously);

    private T? _result;
    public Task<T> Completion => _completionSource.Task;
    public object? Result => _result;
    public QueuedRequest(string connectionId, string entityType, string action, long version, Guid? currentUserId, Func<Task<T>> requestAction, Func<T, long, T> setVersion)
    {
        ConnectionId = connectionId;
        EntityType = entityType;
        Action = action;
        Version = version;
        CurrentUserId = currentUserId;
        _action = requestAction;
        _setVersion = setVersion;
    }
    public async Task ExecuteAsync(long newVersion)
    {
        var result = await _action();
        _result = _setVersion(result, newVersion);
    }
    public void Complete()
    {
        _completionSource.TrySetResult(_result!);
    }
    public void SetException(Exception exception)
    {
        _completionSource.TrySetException(exception);
    }
}


public class RequestQueue
{
    private readonly Channel<IQueuedRequest> _channel;
    private readonly IRealtimeNotifier _notifier;
    private readonly Guid _projectId;
    private long _version = 0;
    public long CurrentVersion => _version;
    public RequestQueue(Guid projectId, IRealtimeNotifier notifier)
    {
        _projectId = projectId;
        _notifier = notifier;

        _channel = Channel.CreateUnbounded<IQueuedRequest>(
            new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });
    }
    public async Task<T> EnqueueRequest<T>(
            string connectionId,
            string entityType,
            string action,
            long version,
            Guid? currentUserId,
            Func<Task<T>> requestAction,
            Func<T, long, T> setVersion)
    {
        var request = new QueuedRequest<T>(connectionId, entityType, action, version, currentUserId, requestAction, setVersion);
        await _channel.Writer.WriteAsync(request);
        return await request.Completion;
    }
    public async Task ProcessRequests(CancellationToken cancellationToken)
    {
        await foreach (
            var request in
            _channel.Reader.ReadAllAsync(cancellationToken))
        {
            try
            {
                if (request.Version != _version)
                    throw new InvalidOperationException($"Версия клиента {request.Version} не совпадает с версией сервера {_version}.");

                await request.ExecuteAsync(newVersion: _version + 1);
                _version++;
                try
                {
                    await _notifier.NotifyProjectStateChangedAsync(
                        _projectId,
                        request.EntityType,
                        request.Action,
                        request.Result!,
                        request.CurrentUserId
                    );
                }
                catch (Exception notifierException)
                {
                    Console.WriteLine(
                        $"Notifier error: {notifierException.Message}"
                    );
                }
                request.Complete();
            }
            catch (Exception ex)
            {
                try
                {
                    await _notifier.NotifyErrorAsync(
                        request.ConnectionId,
                        ex.Message
                    );
                }
                catch (Exception notifierException)
                {
                    Console.WriteLine(
                        $"Notifier error: {notifierException.Message}"
                    );
                }
                request.SetException(ex);
            }
        }
    }
}