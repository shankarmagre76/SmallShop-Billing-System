using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Models;
using SmallShopInventoryBillingAPI.Services;
using Xunit;

namespace SmallShopInventoryBillingAPI.Tests.Inventory;

public class InventoryServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetStockAsync_ExistingProduct_ReturnsStockResponse()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Keyboard", SKU = "KB1", StockQuantity = 20, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<InventoryService>>();
        var service = new InventoryService(context, loggerMock.Object);

        // Act
        var result = await service.GetStockAsync(product.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(20, result.StockQuantity);
        Assert.Equal("Keyboard", result.ProductName);
    }

    [Fact]
    public async Task IncreaseStockAsync_ValidQuantity_IncreasesStock()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Headphones", SKU = "HP1", StockQuantity = 10, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<InventoryService>>();
        var service = new InventoryService(context, loggerMock.Object);

        // Act
        var result = await service.IncreaseStockAsync(product.Id, 15);

        // Assert
        Assert.Equal(25, result.StockQuantity);
        var updatedProduct = await context.Products.FindAsync(product.Id);
        Assert.Equal(25, updatedProduct!.StockQuantity);
    }

    [Fact]
    public async Task DecreaseStockAsync_ValidQuantity_DecreasesStock()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Monitor", SKU = "MN1", StockQuantity = 15, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<InventoryService>>();
        var service = new InventoryService(context, loggerMock.Object);

        // Act
        var result = await service.DecreaseStockAsync(product.Id, 5);

        // Assert
        Assert.Equal(10, result.StockQuantity);
    }

    [Fact]
    public async Task DecreaseStockAsync_InsufficientStock_ThrowsBadRequestExceptionAndStockNotNegative()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Webcam", SKU = "WC1", StockQuantity = 3, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<InventoryService>>();
        var service = new InventoryService(context, loggerMock.Object);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.DecreaseStockAsync(product.Id, 10));
        Assert.Equal("Insufficient stock.", ex.Message);

        var dbProduct = await context.Products.FindAsync(product.Id);
        Assert.Equal(3, dbProduct!.StockQuantity);
        Assert.True(dbProduct.StockQuantity >= 0);
    }

    [Fact]
    public async Task DecreaseStockAsync_ProductNotFound_ThrowsNotFoundException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var loggerMock = new Mock<ILogger<InventoryService>>();
        var service = new InventoryService(context, loggerMock.Object);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => service.DecreaseStockAsync(999, 5));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public async Task IncreaseStockAsync_ZeroOrNegativeQuantity_ThrowsBadRequestException(int invalidQty)
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "TestItem", SKU = "TI1", StockQuantity = 5 };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<InventoryService>>();
        var service = new InventoryService(context, loggerMock.Object);

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => service.IncreaseStockAsync(product.Id, invalidQty));
    }
}
