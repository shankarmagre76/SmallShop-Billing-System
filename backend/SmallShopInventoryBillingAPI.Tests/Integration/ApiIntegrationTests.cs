using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using SmallShopInventoryBillingAPI.DTOs.Auth;
using SmallShopInventoryBillingAPI.DTOs.Bills;
using SmallShopInventoryBillingAPI.DTOs.Inventory;
using SmallShopInventoryBillingAPI.DTOs.Products;
using Xunit;

namespace SmallShopInventoryBillingAPI.Tests.Integration;

public class ApiIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiIntegrationTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> GetAdminTokenAsync()
    {
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "admin@example.com",
            Password = "AdminPassword@123"
        });

        loginResponse.EnsureSuccessStatusCode();
        var data = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        return data!.Token;
    }

    [Fact]
    public async Task Auth_RegisterAndLogin_Flow_Succeeds()
    {
        // 1. Register
        var regEmail = $"staff_int_{Guid.NewGuid():N}@example.com";
        var regRes = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            FullName = "Integration Staff",
            Email = regEmail,
            Password = "Password@123"
        });

        Assert.Equal(HttpStatusCode.Created, regRes.StatusCode);
        var regData = await regRes.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(regData?.Token);

        // 2. Login
        var loginRes = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = regEmail,
            Password = "Password@123"
        });

        Assert.Equal(HttpStatusCode.OK, loginRes.StatusCode);
        var loginData = await loginRes.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(loginData?.Token);
    }

    [Fact]
    public async Task Products_FullCrud_IntegrationFlow()
    {
        var token = await GetAdminTokenAsync();
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/products");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new CreateProductRequest
        {
            Name = "Integration Laptop",
            SKU = $"INT_{Guid.NewGuid():N}".Substring(0, 10),
            Description = "Integration Test Laptop",
            Price = 999.99m,
            StockQuantity = 15,
            TaxRate = 18m
        });

        // 1. Create Product
        var createRes = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var prod = await createRes.Content.ReadFromJsonAsync<ProductResponse>();
        Assert.NotNull(prod);
        Assert.True(prod.Id > 0);

        // 2. Get Product By ID
        var getReq = new HttpRequestMessage(HttpMethod.Get, $"/api/products/{prod.Id}");
        getReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var getRes = await _client.SendAsync(getReq);
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);

        // 3. Get All Products (Paginated)
        var listReq = new HttpRequestMessage(HttpMethod.Get, "/api/products?page=1&pageSize=10");
        listReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var listRes = await _client.SendAsync(listReq);
        Assert.Equal(HttpStatusCode.OK, listRes.StatusCode);

        // 4. Update Product
        var updReq = new HttpRequestMessage(HttpMethod.Put, $"/api/products/{prod.Id}");
        updReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        updReq.Content = JsonContent.Create(new UpdateProductRequest
        {
            Name = "Integration Laptop Pro",
            Price = 1199.99m,
            TaxRate = 18m,
            IsActive = true
        });
        var updRes = await _client.SendAsync(updReq);
        Assert.Equal(HttpStatusCode.OK, updRes.StatusCode);

        // 5. Deactivate Product
        var deactReq = new HttpRequestMessage(HttpMethod.Delete, $"/api/products/{prod.Id}");
        deactReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var deactRes = await _client.SendAsync(deactReq);
        Assert.Equal(HttpStatusCode.NoContent, deactRes.StatusCode);
    }

    [Fact]
    public async Task Inventory_StockManagement_IntegrationFlow()
    {
        var token = await GetAdminTokenAsync();

        // 1. Create Product
        var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/products");
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        createReq.Content = JsonContent.Create(new CreateProductRequest
        {
            Name = "Inventory Test Item",
            SKU = $"INV_{Guid.NewGuid():N}".Substring(0, 10),
            Price = 50m,
            StockQuantity = 10,
            TaxRate = 10m
        });
        var createRes = await _client.SendAsync(createReq);
        var prod = await createRes.Content.ReadFromJsonAsync<ProductResponse>();

        // 2. Increase Stock
        var incReq = new HttpRequestMessage(HttpMethod.Post, $"/api/inventory/{prod!.Id}/increase");
        incReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        incReq.Content = JsonContent.Create(new StockAdjustmentRequest { Quantity = 5 });
        var incRes = await _client.SendAsync(incReq);
        Assert.Equal(HttpStatusCode.OK, incRes.StatusCode);
        var incData = await incRes.Content.ReadFromJsonAsync<StockResponse>();
        Assert.Equal(15, incData!.StockQuantity);

        // 3. Decrease Stock
        var decReq = new HttpRequestMessage(HttpMethod.Post, $"/api/inventory/{prod.Id}/decrease");
        decReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        decReq.Content = JsonContent.Create(new StockAdjustmentRequest { Quantity = 3 });
        var decRes = await _client.SendAsync(decReq);
        Assert.Equal(HttpStatusCode.OK, decRes.StatusCode);
        var decData = await decRes.Content.ReadFromJsonAsync<StockResponse>();
        Assert.Equal(12, decData!.StockQuantity);

        // 4. Get Stock
        var getStockReq = new HttpRequestMessage(HttpMethod.Get, $"/api/inventory/{prod.Id}");
        getStockReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var getStockRes = await _client.SendAsync(getStockReq);
        Assert.Equal(HttpStatusCode.OK, getStockRes.StatusCode);
    }

    [Fact]
    public async Task Billing_CreateAndRetrieveBill_IntegrationFlow()
    {
        var token = await GetAdminTokenAsync();

        // 1. Create Product
        var createReq = new HttpRequestMessage(HttpMethod.Post, "/api/products");
        createReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        createReq.Content = JsonContent.Create(new CreateProductRequest
        {
            Name = "Billable Product",
            SKU = $"BILL_{Guid.NewGuid():N}".Substring(0, 10),
            Price = 200m,
            StockQuantity = 20,
            TaxRate = 10m
        });
        var createRes = await _client.SendAsync(createReq);
        var prod = await createRes.Content.ReadFromJsonAsync<ProductResponse>();

        // 2. Create Bill
        var billReq = new HttpRequestMessage(HttpMethod.Post, "/api/bills");
        billReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        billReq.Content = JsonContent.Create(new CreateBillRequest
        {
            CustomerName = "Integration Customer",
            Items = new List<CreateBillItemRequest>
            {
                new() { ProductId = prod!.Id, Quantity = 2 }
            }
        });
        var billRes = await _client.SendAsync(billReq);

        Assert.Equal(HttpStatusCode.Created, billRes.StatusCode);
        var bill = await billRes.Content.ReadFromJsonAsync<BillResponse>();
        Assert.NotNull(bill);
        Assert.Equal(400m, bill.SubTotal);
        Assert.Equal(40m, bill.TaxAmount);
        Assert.Equal(440m, bill.TotalAmount);

        // 3. Get Bill By ID
        var getBillReq = new HttpRequestMessage(HttpMethod.Get, $"/api/bills/{bill.Id}");
        getBillReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var getBillRes = await _client.SendAsync(getBillReq);
        Assert.Equal(HttpStatusCode.OK, getBillRes.StatusCode);

        // 4. Get All Bills (Paginated)
        var listBillsReq = new HttpRequestMessage(HttpMethod.Get, "/api/bills?page=1&pageSize=10");
        listBillsReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var listBillsRes = await _client.SendAsync(listBillsReq);
        Assert.Equal(HttpStatusCode.OK, listBillsRes.StatusCode);
    }
}
