using System.Security.Claims;
using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FriendshipController(
    IFriendshipService friendshipService) : ControllerBase
{
    [HttpPost("request")]
    public async Task<IActionResult> SendRequest(
        [FromBody] SendFriendRequestDto dto)
    {
        var userIdString =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized("Invalid token");

        try
        {
            await friendshipService.SendRequestAsync(
                userId, dto.FriendId);

            return Ok(new { message = "Заявка отправлена." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
