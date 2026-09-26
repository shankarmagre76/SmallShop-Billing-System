using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using SmallShopInventoryBillingAPI.DTOs.Auth;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Models;
using SmallShopInventoryBillingAPI.Services;
using Xunit;

namespace SmallShopInventoryBillingAPI.Tests.Authentication;

public class AuthServiceTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
    private readonly IConfiguration _configuration;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var storeMock = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(storeMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        var roleStoreMock = new Mock<IRoleStore<IdentityRole>>();
        _roleManagerMock = new Mock<RoleManager<IdentityRole>>(roleStoreMock.Object, null!, null!, null!, null!);

        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:Key", "SuperSecretTestJwtKey12345678901234567890"},
            {"Jwt:Issuer", "TestIssuer"},
            {"Jwt:Audience", "TestAudience"},
            {"Jwt:ExpirationMinutes", "60"}
        };

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _loggerMock = new Mock<ILogger<AuthService>>();

        _authService = new AuthService(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            _configuration,
            _loggerMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_ReturnsAuthResponseWithStaffRole()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "John Staff",
            Email = "john.staff@example.com",
            Password = "Password@123"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync((ApplicationUser?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), request.Password))
            .ReturnsAsync(IdentityResult.Success);

        _roleManagerMock.Setup(x => x.RoleExistsAsync("Staff"))
            .ReturnsAsync(true);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<ApplicationUser>(), "Staff"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(new List<string> { "Staff" });

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Token);
        Assert.Equal("john.staff@example.com", result.Email);
        Assert.Equal("Staff", result.Role);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsConflictException()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Duplicate User",
            Email = "existing@example.com",
            Password = "Password@123"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync(new ApplicationUser { Email = request.Email });

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() => _authService.RegisterAsync(request));
    }

    [Fact]
    public async Task RegisterAsync_InvalidPassword_ThrowsBadRequestException()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Weak Password User",
            Email = "weak@example.com",
            Password = "123"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync((ApplicationUser?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), request.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too short." }));

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => _authService.RegisterAsync(request));
        Assert.Contains("Password too short.", ex.Errors);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@example.com",
            Password = "Password@123"
        };

        var user = new ApplicationUser
        {
            Id = "user-123",
            Email = request.Email,
            FullName = "User Name",
            IsActive = true
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, request.Password))
            .ReturnsAsync(true);

        _userManagerMock.Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Staff" });

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Token);
        Assert.Equal(user.Email, result.Email);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@example.com",
            Password = "WrongPassword"
        };

        var user = new ApplicationUser
        {
            Email = request.Email,
            IsActive = true
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.CheckPasswordAsync(user, request.Password))
            .ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }
}
