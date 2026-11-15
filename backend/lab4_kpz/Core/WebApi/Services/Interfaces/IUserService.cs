using System.Security.Claims;
using lab4_kpz.Entities;

namespace lab4_kpz.Core.WebApi.Services.Interfaces;

public interface IUserService
{
    Task<User> GetOrCreateCurrentUserAsync(ClaimsPrincipal principal, CancellationToken ct = default);
    Task<User?> GetByIdAsync(int userId, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
}

