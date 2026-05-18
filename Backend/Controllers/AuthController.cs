using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService): ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> Register(UserRegisterDto registerDto)
    {
        try
        {
            var userResponseDto = await authService.RegisterAsync(registerDto);
            return Ok(userResponseDto);
        }
        catch(InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponseDto>> Login(UserLoginDto loginDto)
    {
        try{
            var userResponseDto = await authService.LoginAsync(loginDto);
            return Ok(userResponseDto);
        }
        catch(UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}