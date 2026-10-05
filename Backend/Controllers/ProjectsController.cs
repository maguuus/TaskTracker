using System.Security.Claims;
using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController(IProjectService projectService, IProjectAccessService accessService) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetProjectsByUser(Guid userId)
    {
        var tokenUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != CurrentUserId)
        {
            return Forbid("Вы можете просматривать только свои проекты.");
        }

        try
        {
            var projects = await projectService.GetProjectsByUserAsync(userId);
            return Ok(projects);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpPost]
    public async Task<ActionResult<ProjectResponseDto>> CreateProject(ProjectCreateDto projectDto)
    {
        // var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        // if (!Guid.TryParse(userIdString, out var userId))
        // {
        //     return Unauthorized("Invalid token.");
        // }
        
        var secureDto = projectDto with { OwnerId = CurrentUserId };
        
        var projectResponseDto = await projectService.CreateProjectAsync(secureDto);
            
        return Ok(projectResponseDto);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, ProjectUpdateDto projectDto)
    {
        if (!await accessService.IsProjectOwnerAsync(CurrentUserId, id))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Только владелец может изменять параметры проекта.");
        }
        try
        {
            await projectService.UpdateProjectAsync(id, projectDto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    } 
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        if (!await accessService.IsProjectOwnerAsync(CurrentUserId, id))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Только владелец может удалить проект.");
        }
        try
        {
            await projectService.DeleteProjectAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound();
        }
    }
    
    [HttpGet("{id:guid}/members")]
    public async Task<ActionResult<IEnumerable<ProjectMemberDto>>> GetMembers(Guid id)
    {
        try
        {
            var members = await projectService.GetMembersAsync(id, CurrentUserId);
            return Ok(members);
        }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, ex.Message); }
    }

    [HttpPost("{id:guid}/members")]
    public async Task<ActionResult<ProjectMemberDto>> AddMember(Guid id, [FromBody] AddProjectMemberDto dto)
    {
        try
        {
            var member = await projectService.AddMemberAsync(id, CurrentUserId, dto);
            return Ok(member);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, ex.Message); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpPatch("{id:guid}/members/{memberId:guid}")]
    public async Task<IActionResult> UpdateMemberRole(Guid id, Guid memberId, [FromBody] UpdateMemberRoleDto dto)
    {
        try
        {
            await projectService.UpdateMemberRoleAsync(id, CurrentUserId, memberId, dto);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, ex.Message); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpDelete("{id:guid}/members/{memberId:guid}")]
    [HttpDelete("{id:guid}/{memberId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid memberId)
    {
        try
        {
            await projectService.RemoveMemberAsync(id, CurrentUserId, memberId);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, ex.Message); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }
}