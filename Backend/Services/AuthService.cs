using Backend.DTO;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;
public class AuthService: IAuthService
{
    private IUserService _userService;
    //private readonly ITokenService _tokenService;
    public AuthService(IUserService userService)
    {
        _userService = userService;
    }
    public async Task<UserResponseDto> RegisterAsync(UserRegisterDto dto)
    {
        var user = await _userService.CreateUserAsync(dto);
        // TODO: JWT token generation?
        return new UserResponseDto(user.Id, user.Name, user.Email);
    }
    
    public async Task<UserResponseDto> LoginAsync(UserLoginDto dto)
    {
        var user = await _userService.GetByEmailAsync(dto.Email);
        
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }
        
        // TODO: JWT token generation
        
        return new UserResponseDto(user.Id, user.Name, user.Email);
    }
}