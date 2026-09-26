using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmallShopInventoryBillingAPI.Models;

public class Bill
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string BillNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string? CustomerName { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TaxAmount { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<BillItem> BillItems { get; set; } = new List<BillItem>();
}
