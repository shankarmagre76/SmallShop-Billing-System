using System.Text.Json.Serialization;

namespace SmallShopInventoryBillingAPI.DTOs;

public class HealthResponseDto
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = "Healthy";

    [JsonPropertyName("service")]
    public string Service { get; set; } = "SmallShopInventoryBillingAPI";
}
