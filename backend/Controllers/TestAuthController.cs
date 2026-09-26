using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmallShopInventoryBillingAPI.Controllers;

[ApiController]
[Route("api/test-auth")]
public class TestAuthController : ControllerBase
{
    /// <summary>
    /// Test endpoint accessible by any authenticated user.
    /// </summary>
    [HttpGet]
    [Authorize]
    public IActionResult AuthenticatedUserTest()
    {
        return Ok(new { message = "Authentication successful" });
    }

    /// <summary>
    /// Test endpoint accessible by Staff or Admin roles.
    /// </summary>
    [HttpGet("staff")]
    [Authorize(Roles = "Staff,Admin")]
    public IActionResult StaffOrAdminTest()
    {
        return Ok(new { message = "Staff or Admin access granted" });
    }

    /// <summary>
    /// Test endpoint accessible only by Admin role.
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnlyTest()
    {
        return Ok(new { message = "Admin access granted" });
    }
}
