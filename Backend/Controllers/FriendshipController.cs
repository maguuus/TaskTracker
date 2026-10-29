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
    
    [HttpPost("favorites/{friendId:guid}")]
    public async Task<IActionResult> AddFavorite(Guid friendId)
    {
        if (!Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await friendshipService.AddFavoriteAsync(userId, friendId);
            return Ok(new { message = "Пользователь добавлен в избранные." });
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


    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites()
    {
        if (!Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var userId))
        {
            return Unauthorized();
        }

        var favorites = await friendshipService.GetFavoritesAsync(userId);
        return Ok(favorites);
    }

    [HttpDelete("favorites/{friendId:guid}")]
    public async Task<IActionResult> RemoveFavorite(Guid friendId)
    {
        if (!Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await friendshipService.RemoveFavoriteAsync(userId, friendId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
