using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.DTOs.Inventory;
using SmallShopInventoryBillingAPI.DTOs.Products;
using SmallShopInventoryBillingAPI.Services;

namespace SmallShopInventoryBillingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    /// <summary>
    /// Gets low stock active products where StockQuantity &lt;= threshold. (Staff or Admin)
    /// </summary>
    [HttpGet("low-stock")]
    [Authorize(Roles = "Staff,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ProductResponse>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> GetLowStockProducts([FromQuery] int threshold = 5, CancellationToken cancellationToken = default)
    {
        var products = await _inventoryService.GetLowStockProductsAsync(threshold, cancellationToken);
        return Ok(products);
    }

    /// <summary>
    /// Gets current stock level for a product. (Staff or Admin)
    /// </summary>
    [HttpGet("{productId:int}")]
    [Authorize(Roles = "Staff,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(StockResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> GetStock(int productId, CancellationToken cancellationToken = default)
    {
        var stock = await _inventoryService.GetStockAsync(productId, cancellationToken);
        return Ok(stock);
    }

    /// <summary>
    /// Increases stock quantity for a product. (Admin only)
    /// </summary>
    [HttpPost("{productId:int}/increase")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(StockResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> IncreaseStock(int productId, [FromBody] StockAdjustmentRequest request, CancellationToken cancellationToken = default)
    {
        var stock = await _inventoryService.IncreaseStockAsync(productId, request.Quantity, cancellationToken);
        return Ok(stock);
    }

    /// <summary>
    /// Decreases stock quantity for a product. (Admin only)
    /// </summary>
    [HttpPost("{productId:int}/decrease")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(StockResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> DecreaseStock(int productId, [FromBody] StockAdjustmentRequest request, CancellationToken cancellationToken = default)
    {
        var stock = await _inventoryService.DecreaseStockAsync(productId, request.Quantity, cancellationToken);
        return Ok(stock);
    }
}
