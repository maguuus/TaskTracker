using Backend.DTO;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;

public class UserService: IUserService
{
    private readonly AppDbContext context;
    public UserService(AppDbContext context)
    {
        this.context = context;
    }
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Email == email);
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
    //Task<UserResponseDto> UpdateUserAsync(Guid id, UserUpdateDto updateDto);
    //Task<bool> DeleteUserAsync(Guid id){}
}