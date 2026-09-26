using Microsoft.EntityFrameworkCore;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.DTOs.Bills;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Models;

namespace SmallShopInventoryBillingAPI.Services;

public class BillingService : IBillingService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BillingService> _logger;

    public BillingService(ApplicationDbContext context, ILogger<BillingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<BillResponse> CreateBillAsync(CreateBillRequest request, CancellationToken cancellationToken = default)
    {
        var sanitizedCustomerName = request.CustomerName?.Trim();

        // 1. Input validation
        if (request.Items == null || !request.Items.Any())
        {
            throw new BadRequestException("At least one item is required in a bill.");
        }

        if (request.Items.Any(i => i.Quantity <= 0))
        {
            throw new BadRequestException("Quantity for all items must be greater than 0.");
        }

        var productIds = request.Items.Select(i => i.ProductId).ToList();
        if (productIds.Count != productIds.Distinct().Count())
        {
            throw new BadRequestException("Duplicate product entries are not allowed in a bill.");
        }

        // 2. Begin EF Core Database Transaction
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Load products from database with tracking
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, cancellationToken);

            // 3. Verify all products exist
            foreach (var item in request.Items)
            {
                if (!products.ContainsKey(item.ProductId))
                {
                    _logger.LogWarning("CreateBill failed: Product with ID {ProductId} not found", item.ProductId);
                    throw new NotFoundException($"Product with ID {item.ProductId} not found.");
                }
            }

            // 4. Verify all products are active
            foreach (var item in request.Items)
            {
                var product = products[item.ProductId];
                if (!product.IsActive)
                {
                    _logger.LogWarning("CreateBill failed: Product '{Name}' (ID: {ProductId}) is inactive", product.Name, product.Id);
                    throw new BadRequestException($"Product '{product.Name}' is inactive and cannot be billed.");
                }
            }

            // 5. Check available stock for ALL products before performing any stock deduction
            foreach (var item in request.Items)
            {
                var product = products[item.ProductId];
                if (product.StockQuantity < item.Quantity)
                {
                    _logger.LogWarning("CreateBill failed: Insufficient stock for product '{Name}'. Available: {StockQuantity}, Requested: {Requested}", product.Name, product.StockQuantity, item.Quantity);
                    throw new BadRequestException($"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}, Requested: {item.Quantity}.");
                }
            }

            // 6. Deduct stock, calculate totals, and prepare bill entities
            decimal subTotal = 0m;
            decimal totalTaxAmount = 0m;
            var billItemsToCreate = new List<(BillItem Entity, BillItemResponse Response)>();

            foreach (var item in request.Items)
            {
                var product = products[item.ProductId];

                // Deduct stock quantity
                product.StockQuantity -= item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;

                // Preserve historical price and tax rate snapshot
                var unitPrice = product.Price;
                var taxRate = product.TaxRate;

                var lineSubtotal = Math.Round(unitPrice * item.Quantity, 2, MidpointRounding.AwayFromZero);
                var itemTaxAmount = Math.Round(lineSubtotal * (taxRate / 100m), 2, MidpointRounding.AwayFromZero);
                var lineTotal = lineSubtotal + itemTaxAmount;

                subTotal += lineSubtotal;
                totalTaxAmount += itemTaxAmount;

                var billItemEntity = new BillItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    TaxAmount = itemTaxAmount,
                    LineTotal = lineTotal
                };

                var billItemResponse = new BillItemResponse
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    SKU = product.SKU,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    TaxRate = taxRate,
                    TaxAmount = itemTaxAmount,
                    LineTotal = lineTotal
                };

                billItemsToCreate.Add((billItemEntity, billItemResponse));
            }

            decimal totalAmount = subTotal + totalTaxAmount;
            var billNumber = await GenerateUniqueBillNumberAsync(cancellationToken);

            var bill = new Bill
            {
                BillNumber = billNumber,
                CustomerName = sanitizedCustomerName,
                SubTotal = subTotal,
                TaxAmount = totalTaxAmount,
                TotalAmount = totalAmount,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bills.Add(bill);
            await _context.SaveChangesAsync(cancellationToken);

            foreach (var (entity, _) in billItemsToCreate)
            {
                entity.BillId = bill.Id;
                _context.BillItems.Add(entity);
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Bill '{BillNumber}' created successfully with total amount {TotalAmount}", bill.BillNumber, bill.TotalAmount);

            return new BillResponse
            {
                Id = bill.Id,
                BillNumber = bill.BillNumber,
                CustomerName = bill.CustomerName,
                SubTotal = bill.SubTotal,
                TaxAmount = bill.TaxAmount,
                TotalAmount = bill.TotalAmount,
                CreatedAt = bill.CreatedAt,
                Items = billItemsToCreate.Select(x => x.Response).ToList()
            };
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "CreateBill failed due to concurrency conflict");
            throw new ConflictException("Product stock was modified by another transaction. Please retry the bill.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<PagedResponse<BillListResponse>> GetAllBillsAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        ValidatePaginationParameters(page, pageSize);

        var query = _context.Bills.AsNoTracking();

        var totalItems = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BillListResponse
            {
                Id = b.Id,
                BillNumber = b.BillNumber,
                CustomerName = b.CustomerName,
                SubTotal = b.SubTotal,
                TaxAmount = b.TaxAmount,
                TotalAmount = b.TotalAmount,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResponse<BillListResponse>(items, page, pageSize, totalItems);
    }

    public async Task<BillResponse> GetBillByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var bill = await _context.Bills
            .AsNoTracking()
            .Include(b => b.BillItems)
            .ThenInclude(bi => bi.Product)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (bill == null)
        {
            _logger.LogWarning("GetBillById failed: Bill with ID {Id} not found", id);
            throw new NotFoundException($"Bill with ID {id} not found.");
        }

        return new BillResponse
        {
            Id = bill.Id,
            BillNumber = bill.BillNumber,
            CustomerName = bill.CustomerName,
            SubTotal = bill.SubTotal,
            TaxAmount = bill.TaxAmount,
            TotalAmount = bill.TotalAmount,
            CreatedAt = bill.CreatedAt,
            Items = bill.BillItems.Select(bi => new BillItemResponse
            {
                ProductId = bi.ProductId,
                ProductName = bi.Product?.Name ?? string.Empty,
                SKU = bi.Product?.SKU ?? string.Empty,
                Quantity = bi.Quantity,
                UnitPrice = bi.UnitPrice,
                TaxRate = (bi.UnitPrice * bi.Quantity > 0m)
                    ? Math.Round((bi.TaxAmount / (bi.UnitPrice * bi.Quantity)) * 100m, 2, MidpointRounding.AwayFromZero)
                    : (bi.Product?.TaxRate ?? 0m),
                TaxAmount = bi.TaxAmount,
                LineTotal = bi.LineTotal
            }).ToList()
        };
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

    private async Task<string> GenerateUniqueBillNumberAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"INV-{year}-";

        var lastBillNumber = await _context.Bills
            .AsNoTracking()
            .Where(b => b.BillNumber.StartsWith(prefix))
            .OrderByDescending(b => b.Id)
            .Select(b => b.BillNumber)
            .FirstOrDefaultAsync(cancellationToken);

        int sequence = 1;
        if (!string.IsNullOrEmpty(lastBillNumber) && lastBillNumber.Length >= prefix.Length + 6)
        {
            var suffix = lastBillNumber.Substring(prefix.Length);
            if (int.TryParse(suffix, out int parsedSeq))
            {
                sequence = parsedSeq + 1;
            }
        }

        return $"{prefix}{sequence:D6}";
    }
}
