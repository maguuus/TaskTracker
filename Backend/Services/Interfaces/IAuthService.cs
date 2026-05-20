using Backend.DTO;
using Backend.Models;

namespace Backend.Services;
public interface IAuthService
{
    Task<UserResponseDto> RegisterAsync(UserRegisterDto dto);
    Task<UserResponseDto> LoginAsync(UserLoginDto dto);
}