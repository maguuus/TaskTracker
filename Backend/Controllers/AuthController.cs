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
    public async Task<ActionResult<TokenResponseDto>> Register(UserRegisterDto registerDto)
    {
        try
        {
            var tokenResponseDto = await authService.RegisterAsync(registerDto);
            return Ok(tokenResponseDto);
        }
        catch(InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> Login(UserLoginDto loginDto)
    {
        try{
            var tokenResponseDto = await authService.LoginAsync(loginDto);
            return Ok(tokenResponseDto);
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