using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmallShopInventoryBillingAPI.Models;

public class Product
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0.")]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Stock quantity must be greater than or equal to 0.")]
    public int StockQuantity { get; set; }

    [Required]
    [Range(0, 100, ErrorMessage = "Tax rate must be between 0 and 100.")]
    [Column(TypeName = "decimal(5,2)")]
    public decimal TaxRate { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navigation property
    public ICollection<BillItem> BillItems { get; set; } = new List<BillItem>();
}
