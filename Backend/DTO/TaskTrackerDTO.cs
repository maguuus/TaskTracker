namespace Backend.DTO;

public record UserRegisterDto(string? Name, string Email, string Password);
public record UserLoginDto(string Email, string Password);
public record UserResponseDto(Guid Id, string Name, string Email);

public record ProjectCreateDto(string Name, Guid OwnerId, string? Description);
public record ProjectUpdateDto(string Name, string? Description);
public record ProjectResponseDto(Guid Id, string Name, Guid OwnerId, DateTime CreatedAt, string? Description);

public record ColumnCreateDto(string? Title, int OrderIndex, Guid ProjectId);
public record ColumnUpdateDto(string Title, int OrderIndex);
public record ColumnResponseDto(Guid Id, string Title, int OrderIndex, Guid ProjectId);

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
    DateTime? PlannedStartAt);

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
    