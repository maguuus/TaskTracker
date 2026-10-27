using Backend.Models;

namespace Backend.DTO;

public record UserRegisterDto(string? Name, string Email, string Password);
public record UserLoginDto(string Email, string Password);
public record UserResponseDto(Guid Id, string Name, string Email, string? Avatar);

public record ProjectCreateDto(string Name, Guid OwnerId, string? Description,string? Cover);
public record ProjectUpdateDto(string Name, string? Description,string? Cover);
public record ProjectResponseDto(Guid Id, string Name, Guid OwnerId, DateTime CreatedAt, string? Description, ProjectRole Role, string? Cover);


public record ColumnCreateDto(string? Title, int OrderIndex, Guid ProjectId);
public record ColumnUpdateDto(string Title, int OrderIndex);
public record ColumnResponseDto(Guid Id, string Title, int OrderIndex, Guid ProjectId);

public record TokenResponseDto(string AccessToken);
public record ChangePasswordDto(string OldPassword, string NewPassword);
public record ChangeAvatarDto(string Avatar);
public record TaskCreateDto(
    string Title, 
    string? Description, 
    string? Priority, 
    string? Urgency, 
    string? Icon,
    List<string>? Tags,
    Guid ColumnId, 
    int OrderIndex, 
    DateTime? DueDate, 
    DateTime? PlannedStartAt);

public record TaskUpdateDto(string Title, 
    string? Description, 
    string? Priority, 
    string? Urgency,
    string? Icon,
    List<string>? Tags,
    int OrderIndex, 
    Guid ColumnId, 
    DateTime? DueDate, 
    DateTime? PlannedStartAt,
    DateTime UpdatedAt);

public record TaskResponseDto(
    Guid Id, 
    string Title,
    string? Description,
    string? Priority, 
    string? Urgency,
    string? Icon,
    List<string>? Tags,
    int OrderIndex, 
    Guid ColumnId, 
    DateTime CreatedAt, 
    DateTime UpdatedAt, 
    DateTime? DueDate, 
    DateTime? PlannedStartAt);

public record TaskSearchFilterDto(
    string? Query,
    string? Priority,
    string? Urgency,
    string? Tag);

public record TaskSearchResultDto (
    Guid Id,
    Guid ColumnId,
    string ColumnTitle,
    string Title,
    string? Description,
    string? Priority,
    string? Urgency,
    string? Icon,
    List<string>? Tags,
    DateTime? DueDate,
    DateTime UpdatedAt); 
    
public record AddProjectMemberDto(string Email, ProjectRole Role = ProjectRole.Member);
public record UpdateMemberRoleDto(ProjectRole Role);
public record ProjectMemberDto(Guid Id, Guid UserId, string Email, string Name, ProjectRole Role);

public record UserSearchDto(Guid Id, string Name, string Avatar);

public record FriendDto(Guid Id, string Name, string Email);