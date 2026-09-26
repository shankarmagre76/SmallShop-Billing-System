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

public class BillingServiceTests
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
    public async Task CreateBillAsync_SingleProduct_CalculatesCorrectTotalsAndDeductsStock()
    {
        // Arrange: T-Shirt, Price = 500, Tax = 18%, Quantity = 2
        using var context = GetInMemoryDbContext();
        var product = new Product
        {
            Name = "T-Shirt",
            SKU = "TSHIRT1",
            Price = 500m,
            TaxRate = 18m,
            StockQuantity = 10,
            IsActive = true
        };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            CustomerName = "Alice",
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = product.Id, Quantity = 2 }
            }
        };

        // Act
        var response = await service.CreateBillAsync(request);

        // Assert: Subtotal = 1000, Tax = 180, Total = 1180
        Assert.NotNull(response);
        Assert.Equal(1000m, response.SubTotal);
        Assert.Equal(180m, response.TaxAmount);
        Assert.Equal(1180m, response.TotalAmount);
        Assert.StartsWith("INV-", response.BillNumber);

        // Stock deduction check: Started at 10, 2 purchased -> 8 remaining
        var updatedProduct = await context.Products.FindAsync(product.Id);
        Assert.Equal(8, updatedProduct!.StockQuantity);
    }

    [Fact]
    public async Task CreateBillAsync_MultiProduct_CalculatesCorrectTotals()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var prod1 = new Product { Name = "Item A", SKU = "SKUA", Price = 100m, TaxRate = 10m, StockQuantity = 20, IsActive = true };
        var prod2 = new Product { Name = "Item B", SKU = "SKUB", Price = 50m, TaxRate = 5m, StockQuantity = 10, IsActive = true };
        context.Products.AddRange(prod1, prod2);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            CustomerName = "Bob",
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = prod1.Id, Quantity = 2 }, // 200 + 20 tax = 220
                new() { ProductId = prod2.Id, Quantity = 3 }  // 150 + 7.5 tax = 157.50
            }
        };

        // Act
        var response = await service.CreateBillAsync(request);

        // Assert: Subtotal = 350, Tax = 27.50, Total = 377.50
        Assert.Equal(350m, response.SubTotal);
        Assert.Equal(27.50m, response.TaxAmount);
        Assert.Equal(377.50m, response.TotalAmount);
    }

    [Fact]
    public async Task CreateBillAsync_NonExistentProduct_ThrowsNotFoundException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = 9999, Quantity = 1 }
            }
        };

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => service.CreateBillAsync(request));
    }

    [Fact]
    public async Task CreateBillAsync_InactiveProduct_ThrowsBadRequestException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var inactiveProd = new Product { Name = "Discontinued Item", SKU = "DISC1", Price = 10m, StockQuantity = 100, IsActive = false };
        context.Products.Add(inactiveProd);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = inactiveProd.Id, Quantity = 1 }
            }
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.CreateBillAsync(request));
        Assert.Contains("inactive", ex.Message);
    }

    [Fact]
    public async Task CreateBillAsync_DuplicateProductInRequest_ThrowsBadRequestException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var prod = new Product { Name = "Item", SKU = "SKU1", Price = 10m, StockQuantity = 10, IsActive = true };
        context.Products.Add(prod);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = prod.Id, Quantity = 1 },
                new() { ProductId = prod.Id, Quantity = 2 }
            }
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.CreateBillAsync(request));
        Assert.Contains("Duplicate product entries", ex.Message);
    }

    [Fact]
    public async Task CreateBillAsync_InsufficientStock_ThrowsBadRequestException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var prod = new Product { Name = "Limited Stock Item", SKU = "LIM1", Price = 100m, StockQuantity = 2, IsActive = true };
        context.Products.Add(prod);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<BillingService>>();
        var service = new BillingService(context, loggerMock.Object);

        var request = new CreateBillRequest
        {
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = prod.Id, Quantity = 5 } // Requests 5 when only 2 available
            }
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.CreateBillAsync(request));
        Assert.Contains("Insufficient stock", ex.Message);

        // Verify stock remains untouched at 2
        var dbProd = await context.Products.FindAsync(prod.Id);
        Assert.Equal(2, dbProd!.StockQuantity);
    }
}
