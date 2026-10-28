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

    public async Task<User?> GetByNameAsync(string name)
    {
        var normalizedName = name.Trim().ToLower();
        return await context.Users.FirstOrDefaultAsync(u => u.Name.ToLower() == normalizedName);
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
        var name = registerDto.Name?.Trim();
        var email = registerDto.Email.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Введите логин.");
        }
        if (await context.Users.AnyAsync(u => u.Name.ToLower() == name.ToLower()))
        {
            throw new InvalidOperationException("Этот логин уже занят.");
        }
        if (await IsEmailTakenAsync(email))
        {
            throw new InvalidOperationException("Эта почта уже зарегистрирован.");
        }
        if (name.Contains('@'))
        {
            throw new InvalidOperationException("Логин не должен содержать символ @.");
        }
        if (!email.Contains('@'))
        {
            throw new InvalidOperationException("Почта должена содержать символ @.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = name,
            Email = email,
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

    public async Task<List<UserSearchDto>> SearchUsersAsync(string query, Guid currentUserId){
        if (string.IsNullOrWhiteSpace(query))
        {
            return new List<UserSearchDto>();
        }

        return await context.Users
            .Where(u => u.Id != currentUserId &&
                        u.Name.ToLower().Contains(query.Trim().ToLower()))
            .OrderBy(u => u.Name)
            .Select(u => new UserSearchDto(u.Id, u.Name, u.Avatar))
            .Take(20)
            .ToListAsync();
    }
    public async Task<bool> ChangeAvatarAsync(Guid userId, ChangeAvatarDto dto)
    {
        var user = await context.Users.FindAsync(userId);
        if (user is null)
        {
            throw new InvalidOperationException("User not found");
        }
        user.Avatar = dto.Avatar;
        await context.SaveChangesAsync();
        
        return true;
    }
    //Task<UserResponseDto> UpdateUserAsync(Guid id, UserUpdateDto updateDto);
    //Task<bool> DeleteUserAsync(Guid id){}
}