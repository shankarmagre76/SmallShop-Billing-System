using SmallShopInventoryBillingAPI.DTOs.Inventory;
using SmallShopInventoryBillingAPI.DTOs.Products;

namespace SmallShopInventoryBillingAPI.Services;

public interface IInventoryService
{
    Task<StockResponse> GetStockAsync(int productId, CancellationToken cancellationToken = default);
    Task<StockResponse> IncreaseStockAsync(int productId, int quantity, CancellationToken cancellationToken = default);
    Task<StockResponse> DecreaseStockAsync(int productId, int quantity, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProductResponse>> GetLowStockProductsAsync(int threshold = 5, CancellationToken cancellationToken = default);
}
