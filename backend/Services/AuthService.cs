using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using SmallShopInventoryBillingAPI.DTOs.Auth;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Models;

namespace SmallShopInventoryBillingAPI.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var sanitizedEmail = request.Email.Trim();
        var sanitizedFullName = request.FullName.Trim();

        var existingUser = await _userManager.FindByEmailAsync(sanitizedEmail);
        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: Email address '{Email}' is already registered", sanitizedEmail);
            throw new ConflictException("Email address is already registered.");
        }

        var user = new ApplicationUser
        {
            UserName = sanitizedEmail,
            Email = sanitizedEmail,
            FullName = sanitizedFullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            _logger.LogWarning("Registration failed for '{Email}': {Errors}", sanitizedEmail, string.Join("; ", errors));
            throw new BadRequestException("Registration failed.", errors);
        }

        // Ensure default 'Staff' role exists
        const string defaultRole = "Staff";
        if (!await _roleManager.RoleExistsAsync(defaultRole))
        {
            await _roleManager.CreateAsync(new IdentityRole(defaultRole));
        }

        await _userManager.AddToRoleAsync(user, defaultRole);

        var roles = await _userManager.GetRolesAsync(user);
        var authResponse = GenerateJwtToken(user, roles);

        _logger.LogInformation("User '{Email}' registered successfully with role '{Role}'", sanitizedEmail, defaultRole);

        return authResponse;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var sanitizedEmail = request.Email.Trim();

        var user = await _userManager.FindByEmailAsync(sanitizedEmail);
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Invalid login attempt for email '{Email}'", sanitizedEmail);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            await _userManager.AccessFailedAsync(user);
            _logger.LogWarning("Invalid password attempt for email '{Email}'", sanitizedEmail);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        var authResponse = GenerateJwtToken(user, roles);

        _logger.LogInformation("User '{Email}' logged in successfully", sanitizedEmail);

        return authResponse;
    }

    private AuthResponse GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var secretKey = _configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException("JWT secret key is not configured.");
        }

        var issuer = _configuration["Jwt:Issuer"] ?? "SmallShopInventoryAPI";
        var audience = _configuration["Jwt:Audience"] ?? "SmallShopInventoryClients";
        var expirationMinutes = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var mins) ? mins : 60;

        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email!)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenString = tokenHandler.WriteToken(tokenDescriptor);

        return new AuthResponse
        {
            Token = tokenString,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Role = roles.FirstOrDefault() ?? "Staff",
            ExpiresAt = expiresAt
        };
    }
}
