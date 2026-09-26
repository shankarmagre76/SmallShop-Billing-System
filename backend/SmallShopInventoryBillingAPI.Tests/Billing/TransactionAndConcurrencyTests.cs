using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Moq;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.DTOs.Bills;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Models;
using SmallShopInventoryBillingAPI.Services;
using Xunit;

namespace SmallShopInventoryBillingAPI.Tests.Billing;

public class TransactionAndConcurrencyTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateBillAsync_AtomicTransaction_StockDeductedAndBillCreatedOnSuccess()
    {
        // Arrange: Initial stock = 10, purchase = 2
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Atomic Item", SKU = "ATOM1", Price = 50m, StockQuantity = 10, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            CustomerName = "Transaction User",
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = product.Id, Quantity = 2 }
            }
        };

        // Act
        var result = await service.CreateBillAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, await context.Bills.CountAsync());
        Assert.Equal(1, await context.BillItems.CountAsync());

        var dbProduct = await context.Products.FindAsync(product.Id);
        Assert.Equal(8, dbProduct!.StockQuantity);
    }

    [Fact]
    public async Task CreateBillAsync_AtomicTransaction_RollsBackEverythingIfOneItemFails()
    {
        // Arrange: Product 1 has stock = 10, Product 2 has stock = 1
        using var context = GetInMemoryDbContext();
        var prod1 = new Product { Name = "Sufficient Prod", SKU = "SUFF1", Price = 100m, StockQuantity = 10, IsActive = true };
        var prod2 = new Product { Name = "Insufficient Prod", SKU = "INSUFF1", Price = 50m, StockQuantity = 1, IsActive = true };
        context.Products.AddRange(prod1, prod2);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            CustomerName = "Rollback Customer",
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = prod1.Id, Quantity = 2 }, // valid
                new() { ProductId = prod2.Id, Quantity = 5 }  // exceeds stock (only 1 available)!
            }
        };

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => service.CreateBillAsync(request));

        // Assert: NO bill created, NO bill items created, prod1 stock remains untouched at 10
        Assert.Equal(0, await context.Bills.CountAsync());
        Assert.Equal(0, await context.BillItems.CountAsync());

        var dbProd1 = await context.Products.FindAsync(prod1.Id);
        Assert.Equal(10, dbProd1!.StockQuantity);

        var dbProd2 = await context.Products.FindAsync(prod2.Id);
        Assert.Equal(1, dbProd2!.StockQuantity);
    }

    [Fact]
    public async Task ConcurrencyHandling_SimulatedStockProtection_StockNeverBecomesNegative()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "High Demand Item", SKU = "HD1", Price = 10m, StockQuantity = 5, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<InventoryService>>();
        var inventoryService = new InventoryService(context, loggerMock.Object);

        // Request A: 4 items (should succeed)
        var res1 = await inventoryService.DecreaseStockAsync(product.Id, 4);
        Assert.Equal(1, res1.StockQuantity);

        // Request B: 3 items (should fail because available is now 1)
        await Assert.ThrowsAsync<BadRequestException>(() => inventoryService.DecreaseStockAsync(product.Id, 3));

        // Assert: Final stock is 1 and never went negative
        var finalProduct = await context.Products.FindAsync(product.Id);
        Assert.Equal(1, finalProduct!.StockQuantity);
        Assert.True(finalProduct.StockQuantity >= 0);
    }
}
