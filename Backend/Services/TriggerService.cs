using Backend.Data;
using Backend.Models;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class TriggerService(AppDbContext context, IRealtimeNotifier notifier): ITriggerService

{
    public void GetClosedDeadlines()
    {
        DateTime now = DateTime.UtcNow;
        DateTime deadline = now.AddDays(2);
        var query = context.TaskItems.Where(t => now < t.DueDate && t.DueDate < deadline && t.AssigneeId != null);

        for (int i = 0; i < query.Count(); i++)
        {
            var task = query.ElementAt(i);
            var c = task.AssigneeId;
            var f = context.Users.FirstOrDefault(t => t.Id == c);
            Console.WriteLine("\nDEADLINE IS CLOSE");
            Console.WriteLine(f?.Name);
            Console.WriteLine(f?.Email);
            Console.WriteLine(task.Title);
            Console.WriteLine(task.Description);
            Console.WriteLine(task.DueDate);
            Console.WriteLine("YOU SHOULD DO THIS ASAP!\n");
            notifier.NotifyUserDeadline(task.Assignee.Id, task);
        }
        //     .Include(t => t.Column)
        //     .Include(t => t.Assignee)
        //     .Where(t => t.Column != null && t.Column.ProjectId == projectId)
        //     .AsNoTracking();
        // if (!string.IsNullOrWhiteSpace(filter.Query))
        // {
        //     var pattern = $"%{filter.Query.Trim()}%";
        //     query = query.Where(t => EF.Functions.ILike(t.Title, pattern) 
        //                              || (t.Description != null && EF.Functions.ILike(t.Description, pattern)));
        // }
        // if (!string.IsNullOrWhiteSpace(filter.Priority))
        // {
        //     query = query.Where(t => t.Priority == filter.Priority);
        // }
        // if (!string.IsNullOrWhiteSpace(filter.Urgency))
        // {
        //     query = query.Where(t => t.Urgency == filter.Urgency);
        // }
        // if (!string.IsNullOrWhiteSpace(filter.Tag))
        // {
        //     var cleanTag = filter.Tag.Trim().Replace("#", "");
        //     query = query.Where(t => t.Tags != null && t.Tags.Contains(cleanTag));
        // }
        //
        // if (!string.IsNullOrWhiteSpace(filter.Assignees))
        // {
        //     var parts = filter.Assignees.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        //     var includeUnassigned = parts.Any(p => p.Equals("unassigned", StringComparison.OrdinalIgnoreCase));
        //     var targetGuids = parts
        //         .Where(p => Guid.TryParse(p, out _))
        //         .Select(Guid.Parse)
        //         .ToList();
        //
        //     switch (includeUnassigned)
        //     {
        //         case true when targetGuids.Count > 0:
        //             query = query.Where(t => t.AssigneeId == null || (t.AssigneeId.HasValue && targetGuids.Contains(t.AssigneeId.Value)));
        //             break;
        //         case true:
        //             query = query.Where(t => t.AssigneeId == null);
        //             break;
        //         default:
        //         {
        //             if (targetGuids.Count > 0)
        //             {
        //                 query = query.Where(t => t.AssigneeId.HasValue && targetGuids.Contains(t.AssigneeId.Value));
        //             }
        //
        //             break;
        //         }
        //     }
        // }
        // return await query
        //     .OrderBy(t => t.Column!.OrderIndex)
        //     .ThenBy(t => t.OrderIndex)
        //     .Select(t => new TaskSearchResultDto(
        //         t.Id,
        //         t.ColumnId,
        //         t.Column!.Title,
        //         t.Title,
        //         t.Description,
        //         t.Priority,
        //         t.Urgency,
        //         t.Icon,
        //         t.Tags,
        //         t.DueDate,
        //         t.UpdatedAt,
        //         t.AssigneeId,
        //         t.Assignee != null ? t.Assignee.Name : null,
        //         t.Assignee != null ? t.Assignee.Avatar : null
        //     ))
        //     .ToListAsync();
    }
}