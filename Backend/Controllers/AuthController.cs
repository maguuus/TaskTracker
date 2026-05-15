using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext context): ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> Register(UserRegisterDto registerDto)
    {
        if (await context.Users.AnyAsync(u => u.Email == registerDto.Email)) 
        {
            return BadRequest("Email is already taken");
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
        
        return Ok(new UserResponseDto(user.Id, user.Name, user.Email));
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponseDto>> Login(UserLoginDto loginDto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password");
        }
        
        // TODO: JWT Token
        return Ok(new UserResponseDto(user.Id, user.Name, user.Email));
    }
}