using Backend.DTO;
using Backend.Models;
using Backend.Data;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;
public class AuthService(IUserService userService, ITokenService tokenService) : IAuthService
{
    public async Task<TokenResponseDto> RegisterAsync(UserRegisterDto dto)
    {
        var user = await userService.CreateUserAsync(dto);
        var token = tokenService.GenerateToken(user);
        
        return new TokenResponseDto(token);
    }
    
    public async Task<TokenResponseDto> LoginAsync(UserLoginDto dto)
    {
        var user = await userService.GetByEmailAsync(dto.Email);
        
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }
        
        var token = tokenService.GenerateToken(user);
        
        return new TokenResponseDto(token);
    }
}