using SmallShopInventoryBillingAPI.DTOs.Auth;

namespace SmallShopInventoryBillingAPI.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
