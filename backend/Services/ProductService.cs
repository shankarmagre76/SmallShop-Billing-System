using Microsoft.EntityFrameworkCore;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.DTOs.Products;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Models;

namespace SmallShopInventoryBillingAPI.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProductService> _logger;

    public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        var sanitizedSku = request.SKU.Trim().ToUpperInvariant();
        var sanitizedName = request.Name.Trim();
        var sanitizedDesc = request.Description?.Trim();

        var existingProduct = await _context.Products
            .AnyAsync(p => p.SKU.ToLower() == sanitizedSku.ToLower(), cancellationToken);

        if (existingProduct)
        {
            _logger.LogWarning("Attempted to create product with duplicate SKU '{SKU}'", sanitizedSku);
            throw new ConflictException($"Product with SKU '{sanitizedSku}' already exists.");
        }

        var product = new Product
        {
            Name = sanitizedName,
            SKU = sanitizedSku,
            Description = sanitizedDesc,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            TaxRate = request.TaxRate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Product '{Name}' created successfully with SKU '{SKU}' (ID: {Id})", product.Name, product.SKU, product.Id);

        return MapToProductResponse(product);
    }

    public async Task<PagedResponse<ProductResponse>> GetAllProductsAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        ValidatePaginationParameters(page, pageSize);

        var query = _context.Products.AsNoTracking();

        var totalItems = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => MapToProductResponse(p))
            .ToListAsync(cancellationToken);

        return new PagedResponse<ProductResponse>(items, page, pageSize, totalItems);
    }

    public async Task<ProductResponse> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product == null)
        {
            _logger.LogWarning("Product with ID {Id} not found", id);
            throw new NotFoundException($"Product with ID {id} not found.");
        }

        return MapToProductResponse(product);
    }

    public async Task<ProductResponse> UpdateProductAsync(int id, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product == null)
        {
            _logger.LogWarning("Attempted to update non-existent product with ID {Id}", id);
            throw new NotFoundException($"Product with ID {id} not found.");
        }

        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.TaxRate = request.TaxRate;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Product with ID {Id} updated successfully", id);

        return MapToProductResponse(product);
    }

    public async Task DeactivateProductAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product == null)
        {
            _logger.LogWarning("Attempted to deactivate non-existent product with ID {Id}", id);
            throw new NotFoundException($"Product with ID {id} not found.");
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Product with ID {Id} deactivated successfully", id);
    }

    public async Task<PagedResponse<ProductResponse>> SearchProductsAsync(string? query, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        ValidatePaginationParameters(page, pageSize);

        var dbQuery = _context.Products.AsNoTracking().Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalizedQuery = query.Trim().ToLower();
            dbQuery = dbQuery.Where(p => p.Name.ToLower().Contains(normalizedQuery) || p.SKU.ToLower().Contains(normalizedQuery));
        }

        var totalItems = await dbQuery.CountAsync(cancellationToken);
        var items = await dbQuery
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => MapToProductResponse(p))
            .ToListAsync(cancellationToken);

        return new PagedResponse<ProductResponse>(items, page, pageSize, totalItems);
    }

    private static void ValidatePaginationParameters(int page, int pageSize)
    {
        if (page <= 0)
        {
            throw new BadRequestException("Page number must be greater than 0.");
        }

        if (pageSize <= 0 || pageSize > 50)
        {
            throw new BadRequestException("Page size must be between 1 and 50.");
        }
    }

    private static ProductResponse MapToProductResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            SKU = product.SKU,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            TaxRate = product.TaxRate,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}
