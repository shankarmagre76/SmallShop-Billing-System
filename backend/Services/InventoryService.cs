using Microsoft.EntityFrameworkCore;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.DTOs.Inventory;
using SmallShopInventoryBillingAPI.DTOs.Products;
using SmallShopInventoryBillingAPI.Exceptions;

namespace SmallShopInventoryBillingAPI.Services;

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(ApplicationDbContext context, ILogger<InventoryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<StockResponse> GetStockAsync(int productId, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
        {
            _logger.LogWarning("GetStock failed: Product with ID {ProductId} not found", productId);
            throw new NotFoundException($"Product with ID {productId} not found.");
        }

        return new StockResponse
        {
            ProductId = product.Id,
            ProductName = product.Name,
            SKU = product.SKU,
            StockQuantity = product.StockQuantity,
            UpdatedAt = product.UpdatedAt
        };
    }

    public async Task<StockResponse> IncreaseStockAsync(int productId, int quantity, CancellationToken cancellationToken = default)
    {
        if (quantity <= 0)
        {
            throw new BadRequestException("Quantity must be greater than 0.");
        }

        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        if (product == null)
        {
            _logger.LogWarning("IncreaseStock failed: Product with ID {ProductId} not found", productId);
            throw new NotFoundException($"Product with ID {productId} not found.");
        }

        product.StockQuantity += quantity;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Stock increased for Product ID {ProductId} by {Quantity}. New Stock: {NewStock}", productId, quantity, product.StockQuantity);

        return new StockResponse
        {
            ProductId = product.Id,
            ProductName = product.Name,
            SKU = product.SKU,
            StockQuantity = product.StockQuantity,
            UpdatedAt = product.UpdatedAt
        };
    }

    public async Task<StockResponse> DecreaseStockAsync(int productId, int quantity, CancellationToken cancellationToken = default)
    {
        if (quantity <= 0)
        {
            throw new BadRequestException("Quantity must be greater than 0.");
        }

        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        if (product == null)
        {
            _logger.LogWarning("DecreaseStock failed: Product with ID {ProductId} not found", productId);
            throw new NotFoundException($"Product with ID {productId} not found.");
        }

        if (product.StockQuantity < quantity)
        {
            _logger.LogWarning("DecreaseStock failed: Insufficient stock for Product ID {ProductId}. Requested: {Requested}, Available: {Available}", productId, quantity, product.StockQuantity);
            throw new BadRequestException("Insufficient stock.");
        }

        product.StockQuantity -= quantity;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Stock decreased for Product ID {ProductId} by {Quantity}. New Stock: {NewStock}", productId, quantity, product.StockQuantity);

        return new StockResponse
        {
            ProductId = product.Id,
            ProductName = product.Name,
            SKU = product.SKU,
            StockQuantity = product.StockQuantity,
            UpdatedAt = product.UpdatedAt
        };
    }

    public async Task<IEnumerable<ProductResponse>> GetLowStockProductsAsync(int threshold = 5, CancellationToken cancellationToken = default)
    {
        if (threshold < 0)
        {
            throw new BadRequestException("Threshold must be greater than or equal to 0.");
        }

        var products = await _context.Products
            .AsNoTracking()
            .Where(p => p.IsActive && p.StockQuantity <= threshold)
            .OrderBy(p => p.StockQuantity)
            .ToListAsync(cancellationToken);

        return products.Select(p => new ProductResponse
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Description = p.Description,
            Price = p.Price,
            StockQuantity = p.StockQuantity,
            TaxRate = p.TaxRate,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        });
    }
}
