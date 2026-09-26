using System.ComponentModel.DataAnnotations;

namespace SmallShopInventoryBillingAPI.DTOs.Bills;

public class CreateBillRequest
{
    [StringLength(100, ErrorMessage = "Customer name cannot exceed 100 characters.")]
    public string? CustomerName { get; set; }

    [Required(ErrorMessage = "At least one item is required in a bill.")]
    [MinLength(1, ErrorMessage = "At least one item is required in a bill.")]
    public List<CreateBillItemRequest> Items { get; set; } = new();
}
