namespace SmallShopInventoryBillingAPI.DTOs.Bills;

public class BillSummaryResponse
{
    public int Id { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}
