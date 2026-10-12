using Backend.Models;

namespace Backend.DTO;

public record DeleteDto(long Version);
public record DeleteResponseDto(Guid Id, long Version);
public record UserRegisterDto(string? Name, string Email, string Password);
public record UserLoginDto(string Email, string Password);
public record UserResponseDto(Guid Id, string Name, string Email);

public record ProjectCreateDto(string Name, Guid OwnerId, string? Description);
public record ProjectUpdateDto(string Name, string? Description);
public record ProjectResponseDto(Guid Id, string Name, Guid OwnerId, DateTime CreatedAt, string? Description, ProjectRole Role);


public record ColumnCreateDto(string? Title, int OrderIndex, Guid ProjectId, long Version);
public record ColumnUpdateDto(string Title, int OrderIndex, long Version);
public record ColumnResponseDto(Guid Id, string Title, int OrderIndex, Guid ProjectId, long Version = 0);

public record TokenResponseDto(string AccessToken);
public record ChangePasswordDto(string OldPassword, string NewPassword);

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
    DateTime? PlannedStartAt,
    long Version);

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
    DateTime UpdatedAt,
    long Version);

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
    DateTime? PlannedStartAt, 
    long Version = 0);


public record AddProjectMemberDto(string Email, ProjectRole Role = ProjectRole.Member);
public record UpdateMemberRoleDto(ProjectRole Role);
public record ProjectMemberDto(Guid Id, Guid UserId, string Email, string Name, ProjectRole Role);