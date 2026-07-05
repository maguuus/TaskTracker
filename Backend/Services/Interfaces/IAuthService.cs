using Backend.DTO;
using Backend.Models;

namespace Backend.Services;
public interface IAuthService
{
    Task<TokenResponseDto> RegisterAsync(UserRegisterDto dto);
    Task<TokenResponseDto> LoginAsync(UserLoginDto dto);
}