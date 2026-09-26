using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmallShopInventoryBillingAPI.Models;

namespace SmallShopInventoryBillingAPI.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<Bill> Bills { get; set; } = null!;
    public DbSet<BillItem> BillItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Product Entity Configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.HasIndex(p => p.SKU)
                .IsUnique()
                .HasDatabaseName("IX_Products_SKU");

            entity.HasIndex(p => p.Name)
                .HasDatabaseName("IX_Products_Name");

            entity.HasIndex(p => p.IsActive)
                .HasDatabaseName("IX_Products_IsActive");

            entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(p => p.SKU)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(p => p.Description)
                .HasMaxLength(500);

            entity.Property(p => p.Price)
                .HasPrecision(18, 2);

            entity.Property(p => p.TaxRate)
                .HasPrecision(5, 2);

            entity.Property(p => p.IsActive)
                .HasDefaultValue(true);

            entity.Property(p => p.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(p => p.RowVersion)
                .IsRowVersion();
        });

        // Bill Entity Configuration
        modelBuilder.Entity<Bill>(entity =>
        {
            entity.HasKey(b => b.Id);

            entity.HasIndex(b => b.BillNumber)
                .IsUnique()
                .HasDatabaseName("IX_Bills_BillNumber");

            entity.HasIndex(b => b.CreatedAt)
                .HasDatabaseName("IX_Bills_CreatedAt");

            entity.Property(b => b.BillNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(b => b.CustomerName)
                .HasMaxLength(100);

            entity.Property(b => b.SubTotal)
                .HasPrecision(18, 2);

            entity.Property(b => b.TaxAmount)
                .HasPrecision(18, 2);

            entity.Property(b => b.TotalAmount)
                .HasPrecision(18, 2);

            entity.Property(b => b.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        });

        // BillItem Entity Configuration
        modelBuilder.Entity<BillItem>(entity =>
        {
            entity.HasKey(bi => bi.Id);

            entity.Property(bi => bi.UnitPrice)
                .HasPrecision(18, 2);

            entity.Property(bi => bi.TaxAmount)
                .HasPrecision(18, 2);

            entity.Property(bi => bi.LineTotal)
                .HasPrecision(18, 2);

            // Relationships
            entity.HasOne(bi => bi.Bill)
                .WithMany(b => b.BillItems)
                .HasForeignKey(bi => bi.BillId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(bi => bi.Product)
                .WithMany(p => p.BillItems)
                .HasForeignKey(bi => bi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
