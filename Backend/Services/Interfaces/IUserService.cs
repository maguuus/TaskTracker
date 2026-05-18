using Backend.DTO;
using Backend.Models;

namespace Backend.Services;

public interface IUserService
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> IsEmailTakenAsync(string email);
    Task<User> CreateUserAsync(UserRegisterDto registerDto);
    //Task<UserResponseDto> UpdateUserAsync(Guid id, UserUpdateDto updateDto);
    //Task<bool> DeleteUserAsync(Guid id);
}