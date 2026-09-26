using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.DTOs.Products;

namespace SmallShopInventoryBillingAPI.Services;

public interface IProductService
{
    Task<ProductResponse> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<PagedResponse<ProductResponse>> GetAllProductsAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<ProductResponse> GetProductByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductResponse> UpdateProductAsync(int id, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task DeactivateProductAsync(int id, CancellationToken cancellationToken = default);
    Task<PagedResponse<ProductResponse>> SearchProductsAsync(string? query, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
}
