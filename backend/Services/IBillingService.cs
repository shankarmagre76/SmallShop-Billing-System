using SmallShopInventoryBillingAPI.DTOs.Bills;
using SmallShopInventoryBillingAPI.DTOs.Common;

namespace SmallShopInventoryBillingAPI.Services;

public interface IBillingService
{
    Task<BillResponse> CreateBillAsync(CreateBillRequest request, CancellationToken cancellationToken = default);
    Task<PagedResponse<BillListResponse>> GetAllBillsAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<BillResponse> GetBillByIdAsync(int id, CancellationToken cancellationToken = default);
}
