using System.Threading.Channels;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Queue;


public interface IQueuedRequest
{
    string ConnectionId { get; }
    string EntityType { get; }
    string Action { get; }
    object? Result { get; }
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
    private readonly Func<T, long, T> _setVersion;
    private readonly Func<Task<T>> _action;
    private readonly TaskCompletionSource<T> _completionSource =
        new(TaskCreationOptions.RunContinuationsAsynchronously);

    private T? _result;
    public Task<T> Completion => _completionSource.Task;
    public object? Result => _result;
    public QueuedRequest(string connectionId, string entityType, string action, long version, Func<Task<T>> requestAction, Func<T, long, T> setVersion)
    {
        ConnectionId = connectionId;
        EntityType = entityType;
        Action = action;
        Version = version;
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
    public void Complete()
    {
        _channel.Writer.TryComplete();
    }
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
            Func<Task<T>> requestAction,
            Func<T, long, T> setVersion)
    {
        var request = new QueuedRequest<T>(connectionId, entityType, action, version, requestAction, setVersion);
        await _channel.Writer.WriteAsync(request);
        return await request.Completion;
    }
    public async Task ProcessRequests(CancellationToken cancellationToken)
    {
        await foreach (var request in _channel.Reader.ReadAllAsync(cancellationToken))
        {
            try
            {
                if (request.Version != _version)
                    throw new InvalidOperationException("Version conflict");

                await request.ExecuteAsync(newVersion: _version + 1);
                _version++;

                _ = _notifier.NotifyProjectGroupAsync(
                    _projectId,
                    request.EntityType,
                    request.Action,
                    request.Result!,
                    request.ConnectionId
                );

                request.Complete();
            }
            catch (Exception ex)
            {
                var message = ex switch
                {
                    DbUpdateConcurrencyException => "Данные были изменены другим пользователем. Обновите данные.",
                    InvalidOperationException when ex.Message == "Version conflict" => "Версия данных устарела. Обновите данные.",
                    InvalidOperationException when ex.Message == "Task not found" => "Задача не найдена.",
                    InvalidOperationException when ex.Message == "Column not found" => "Колонка не найдена.",
                    InvalidOperationException when ex.Message == "Target column not found" => "Колонка не найдена.",
                    InvalidOperationException when ex.Message == "Project not found" => "Проект не найден.",
                    _ => "Внутренняя ошибка сервера."
                };

                Console.WriteLine($"Request error: {ex}");

                _ = _notifier.NotifyErrorAsync(request.ConnectionId, message);
                request.SetException(ex);
            }
        }
    }
}