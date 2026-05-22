using Backend.Models;

namespace Backend.Services.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}