using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.Exceptions;
using SmallShopInventoryBillingAPI.Middleware;
using Xunit;

namespace SmallShopInventoryBillingAPI.Tests.Middleware;

public class GlobalExceptionMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_NotFoundException_Returns404NotFoundJson()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<GlobalExceptionMiddleware>>();
        RequestDelegate next = (ctx) => throw new NotFoundException("Item missing");
        var middleware = new GlobalExceptionMiddleware(next, loggerMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal((int)HttpStatusCode.NotFound, context.Response.StatusCode);
        Assert.Equal("application/json", context.Response.ContentType);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.NotNull(errorResponse);
        Assert.Equal(404, errorResponse.StatusCode);
        Assert.Equal("Item missing", errorResponse.Message);
    }

    [Fact]
    public async Task InvokeAsync_BadRequestException_Returns400BadRequestJson()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<GlobalExceptionMiddleware>>();
        RequestDelegate next = (ctx) => throw new BadRequestException("Invalid data", new[] { "Error line 1" });
        var middleware = new GlobalExceptionMiddleware(next, loggerMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal((int)HttpStatusCode.BadRequest, context.Response.StatusCode);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.NotNull(errorResponse);
        Assert.Equal(400, errorResponse.StatusCode);
        Assert.Equal("Invalid data", errorResponse.Message);
        Assert.Single(errorResponse.Errors);
    }

    [Fact]
    public async Task InvokeAsync_UnhandledException_Returns500InternalServerErrorWithoutStackTrace()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<GlobalExceptionMiddleware>>();
        RequestDelegate next = (ctx) => throw new Exception("Database crash details connection string = xxx");
        var middleware = new GlobalExceptionMiddleware(next, loggerMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal((int)HttpStatusCode.InternalServerError, context.Response.StatusCode);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.NotNull(errorResponse);
        Assert.Equal(500, errorResponse.StatusCode);
        Assert.Equal("An unexpected error occurred.", errorResponse.Message);
        Assert.DoesNotContain("connection string", responseBody);
    }
}
