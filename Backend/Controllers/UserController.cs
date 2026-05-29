using System.Security.Claims;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserService userService): ControllerBase
{
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponseDto>> GetProfile()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Invalid token");
        }
        var user = await userService.GetByIdAsync(userId);
        if (user is null)
        {
            return NotFound("User not found");
        }
        return Ok(new UserResponseDto(user.Id, user.Name, user.Email));
    }
}