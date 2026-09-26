using System.ComponentModel.DataAnnotations;

namespace SmallShopInventoryBillingAPI.DTOs.Products;

public class UpdateProductRequest
{
    [Required(ErrorMessage = "Product name is required.")]
    [StringLength(100, ErrorMessage = "Product name cannot exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Price is required.")]
    [Range(0, (double)decimal.MaxValue, ErrorMessage = "Price must be greater than or equal to 0.")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "Tax rate is required.")]
    [Range(0, 100, ErrorMessage = "Tax rate must be between 0 and 100.")]
    public decimal TaxRate { get; set; }

    public bool IsActive { get; set; } = true;
}
