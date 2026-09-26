using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.DTOs.Products;
using SmallShopInventoryBillingAPI.Services;

namespace SmallShopInventoryBillingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Gets all products with pagination. (Staff or Admin)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Staff,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<ProductResponse>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> GetAllProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var products = await _productService.GetAllProductsAsync(page, pageSize, cancellationToken);
        return Ok(products);
    }

    /// <summary>
    /// Searches active products by name or SKU with pagination. (Staff or Admin)
    /// </summary>
    [HttpGet("search")]
    [Authorize(Roles = "Staff,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagedResponse<ProductResponse>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> SearchProducts([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var products = await _productService.SearchProductsAsync(query, page, pageSize, cancellationToken);
        return Ok(products);
    }

    /// <summary>
    /// Gets a product by ID. (Staff or Admin)
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProductResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> GetProductById(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productService.GetProductByIdAsync(id, cancellationToken);
        return Ok(product);
    }

    /// <summary>
    /// Creates a new product. (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ProductResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _productService.CreateProductAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
    }

    /// <summary>
    /// Updates an existing product without changing stock quantity. (Admin only)
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProductResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ErrorResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _productService.UpdateProductAsync(id, request, cancellationToken);
        return Ok(product);
    }

    /// <summary>
    /// Soft deactivates a product. (Admin only)
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ErrorResponse))]
    public async Task<IActionResult> DeactivateProduct(int id, CancellationToken cancellationToken = default)
    {
        await _productService.DeactivateProductAsync(id, cancellationToken);
        return NoContent();
    }
}
