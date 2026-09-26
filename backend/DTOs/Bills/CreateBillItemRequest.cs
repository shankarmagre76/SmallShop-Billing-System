using System.ComponentModel.DataAnnotations;

namespace SmallShopInventoryBillingAPI.DTOs.Bills;

public class CreateBillItemRequest
{
    [Required(ErrorMessage = "ProductId is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "ProductId must be a positive integer.")]
    public int ProductId { get; set; }

    [Required(ErrorMessage = "Quantity is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
    public int Quantity { get; set; }
}
