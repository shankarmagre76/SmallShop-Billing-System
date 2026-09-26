namespace SmallShopInventoryBillingAPI.DTOs.Inventory;

public class StockResponse
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
