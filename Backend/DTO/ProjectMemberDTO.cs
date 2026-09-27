namespace Backend.DTO;

public record AddProjectMemberDto(string Email);
public record ProjectMemberDto(Guid UserId, string Email,string Name, string Role);