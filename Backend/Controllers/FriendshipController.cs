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

    [HttpGet("requests")]
    public async Task<IActionResult> GetIncomingRequests()
    {
        if (!Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var userId))
        {
            return Unauthorized();
        }

        var requests =
            await friendshipService.GetIncomingRequestsAsync(userId);

        return Ok(requests);
    }

    [HttpPost("requests/{requestId:guid}/accept")]
    public async Task<IActionResult> AcceptRequest(Guid requestId)
    {
        if (!Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await friendshipService.AcceptRequestAsync(userId, requestId);
            return Ok(new { message = "Заявка принята." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("requests/{requestId:guid}/reject")]
    public async Task<IActionResult> RejectRequest(Guid requestId)
    {
        if (!Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await friendshipService.RejectRequestAsync(userId, requestId);
            return Ok(new { message = "Заявка отклонена." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

}
