using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.Exceptions;

namespace SmallShopInventoryBillingAPI.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        int statusCode = (int)HttpStatusCode.InternalServerError;
        string message = "An unexpected error occurred.";
        List<string> errors = new();

        switch (exception)
        {
            case NotFoundException ex:
                statusCode = (int)HttpStatusCode.NotFound;
                message = ex.Message;
                _logger.LogWarning(ex, "Resource not found: {Message}", ex.Message);
                break;

            case BadRequestException ex:
                statusCode = (int)HttpStatusCode.BadRequest;
                message = ex.Message;
                errors = ex.Errors;
                _logger.LogWarning(ex, "Bad request: {Message}", ex.Message);
                break;

            case ConflictException ex:
                statusCode = (int)HttpStatusCode.Conflict;
                message = ex.Message;
                _logger.LogWarning(ex, "Conflict: {Message}", ex.Message);
                break;

            case DbUpdateConcurrencyException ex:
                statusCode = (int)HttpStatusCode.Conflict;
                message = "A concurrency conflict occurred. The resource was modified by another operation. Please try again.";
                _logger.LogError(ex, "Database concurrency conflict occurred");
                break;

            case UnauthorizedAccessException ex:
                statusCode = (int)HttpStatusCode.Unauthorized;
                message = ex.Message;
                _logger.LogWarning(ex, "Unauthorized access: {Message}", ex.Message);
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                message = "An unexpected error occurred.";
                _logger.LogError(exception, "Unhandled exception occurred while processing request {TraceId}", context.TraceIdentifier);
                break;
        }

        var response = new ErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Errors = errors,
            TraceId = context.TraceIdentifier
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
