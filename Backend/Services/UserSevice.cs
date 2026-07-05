using Backend.DTO;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class UserService(AppDbContext context) : IUserService
{
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await context.Users.FindAsync(id);
    }

    public async Task<bool> IsEmailTakenAsync(string email)
    {
        return await context.Users.AnyAsync(u => u.Email == email);
    }
    public async Task<User> CreateUserAsync(UserRegisterDto registerDto)
    {
        if (await IsEmailTakenAsync(registerDto.Email)) 
        {
            throw new InvalidOperationException("Email is already taken");
        }

        var finalName = string.IsNullOrWhiteSpace(registerDto.Name) 
            ? registerDto.Email.Split('@')[0] 
            : registerDto.Name;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = finalName,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
        };
        
        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user;
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await context.Users.FindAsync(userId);
        if (user is null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid old password");
        }
        
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await context.SaveChangesAsync();
        
        return true;
}
    //Task<UserResponseDto> UpdateUserAsync(Guid id, UserUpdateDto updateDto);
    //Task<bool> DeleteUserAsync(Guid id){}
}