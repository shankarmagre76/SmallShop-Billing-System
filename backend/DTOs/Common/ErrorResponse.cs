namespace SmallShopInventoryBillingAPI.DTOs.Common;

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
    public string TraceId { get; set; } = string.Empty;
}
