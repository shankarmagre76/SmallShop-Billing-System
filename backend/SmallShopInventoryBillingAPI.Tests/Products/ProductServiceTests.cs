using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.DTOs.Products;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Models;
using SmallShopInventoryBillingAPI.Services;
using Xunit;

namespace SmallShopInventoryBillingAPI.Tests.Products;

public class ProductServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateProductAsync_ValidRequest_CreatesProductAndReturnsResponse()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var loggerMock = new Mock<ILogger<ProductService>>();
        var service = new ProductService(context, loggerMock.Object);

        var request = new CreateProductRequest
        {
            Name = "  Test Laptop  ",
            SKU = "  LAP123  ",
            Description = "Gaming Laptop",
            Price = 1500m,
            StockQuantity = 10,
            TaxRate = 18m
        };

        // Act
        var response = await service.CreateProductAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.Equal("Test Laptop", response.Name);
        Assert.Equal("LAP123", response.SKU);
        Assert.True(response.IsActive);
        Assert.Equal(1, await context.Products.CountAsync());
    }

    [Fact]
    public async Task CreateProductAsync_DuplicateSKU_ThrowsConflictException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        context.Products.Add(new Product { Name = "Existing Laptop", SKU = "LAP123", Price = 1000m });
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<ProductService>>();
        var service = new ProductService(context, loggerMock.Object);

        var request = new CreateProductRequest
        {
            Name = "New Laptop",
            SKU = "lap123",
            Price = 1200m,
            StockQuantity = 5,
            TaxRate = 18m
        };

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() => service.CreateProductAsync(request));
    }

    [Fact]
    public async Task GetProductByIdAsync_ExistingId_ReturnsProductResponse()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Mouse", SKU = "MS123", Price = 25m, StockQuantity = 50, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<ProductService>>();
        var service = new ProductService(context, loggerMock.Object);

        // Act
        var response = await service.GetProductByIdAsync(product.Id);

        // Assert
        Assert.NotNull(response);
        Assert.Equal("Mouse", response.Name);
    }

    [Fact]
    public async Task GetProductByIdAsync_NonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var loggerMock = new Mock<ILogger<ProductService>>();
        var service = new ProductService(context, loggerMock.Object);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => service.GetProductByIdAsync(999));
    }

    [Fact]
    public async Task UpdateProductAsync_ValidRequest_UpdatesProduct()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Old Name", SKU = "SKU1", Price = 10m, StockQuantity = 5, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<ProductService>>();
        var service = new ProductService(context, loggerMock.Object);

        var updateRequest = new UpdateProductRequest
        {
            Name = "New Name Pro",
            Price = 20m,
            TaxRate = 12m,
            IsActive = true
        };

        // Act
        var response = await service.UpdateProductAsync(product.Id, updateRequest);

        // Assert
        Assert.Equal("New Name Pro", response.Name);
        Assert.Equal(20m, response.Price);
    }

    [Fact]
    public async Task DeactivateProductAsync_ExistingProduct_SetsIsActiveToFalse()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var product = new Product { Name = "Item", SKU = "ITEM1", Price = 5m, IsActive = true };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var loggerMock = new Mock<ILogger<ProductService>>();
        var service = new ProductService(context, loggerMock.Object);

        // Act
        await service.DeactivateProductAsync(product.Id);

        // Assert
        var updatedProduct = await context.Products.FindAsync(product.Id);
        Assert.False(updatedProduct!.IsActive);
    }
}
