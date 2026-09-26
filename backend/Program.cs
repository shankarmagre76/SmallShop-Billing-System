using System.Reflection;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmallShopInventoryBillingAPI.Data;
using SmallShopInventoryBillingAPI.DTOs.Common;
using SmallShopInventoryBillingAPI.Middleware;
using SmallShopInventoryBillingAPI.Models;
using SmallShopInventoryBillingAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Service Registration
// ==========================================

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Custom Model State Validation Response format matching ErrorResponse
        options.InvalidModelStateResponseFactory = actionContext =>
        {
            var errors = actionContext.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? e.Exception?.Message ?? "Invalid input value." : e.ErrorMessage)
                .ToList();

            var errorResponse = new ErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Validation failed.",
                Errors = errors,
                TraceId = actionContext.HttpContext.TraceIdentifier
            };

            return new BadRequestObjectResult(errorResponse);
        };
    });

// Register Health Checks for Application & Database
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database");

// Register Entity Framework Core ApplicationDbContext with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS Policy
var allowedOrigins = builder.Configuration["AllowedOrigins"];
var originsList = !string.IsNullOrWhiteSpace(allowedOrigins)
    ? allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    : new[] { "http://localhost:5173", "http://localhost:5174" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(originsList)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password Security Requirements
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;

    // User Requirements
    options.User.RequireUniqueEmail = true;

    // Lockout Settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Bearer Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (builder.Environment.IsDevelopment())
    {
        jwtKey = "SmallShopSuperSecretDefaultDevelopmentJwtKey2026!#$";
    }
    else
    {
        throw new InvalidOperationException("JWT Key is missing. Configure 'Jwt:Key' or environment variable 'Jwt__Key' for production.");
    }
}

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "SmallShopInventoryAPI",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "SmallShopInventoryClients",
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";

            var errorResponse = new ErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = "Unauthorized access. Missing or invalid JWT token.",
                Errors = new List<string>(),
                TraceId = context.HttpContext.TraceIdentifier
            };

            var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            return context.Response.WriteAsync(json);
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";

            var errorResponse = new ErrorResponse
            {
                StatusCode = StatusCodes.Status403Forbidden,
                Message = "Forbidden access. You do not have sufficient permissions or role for this resource.",
                Errors = new List<string>(),
                TraceId = context.HttpContext.TraceIdentifier
            };

            var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            return context.Response.WriteAsync(json);
        }
    };
});

// Configure Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("StaffOrAdmin", policy => policy.RequireRole("Staff", "Admin"));
});

// Register Custom Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IBillingService, BillingService>();

// Configure Swagger / OpenAPI Documentation with JWT Bearer Support & XML Comments
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Small Shop Inventory & Billing API",
        Version = "v1",
        Description = "RESTful backend API for small retail shop inventory and billing operations with JWT Security."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// ==========================================
// 2. HTTP Request Pipeline Configuration
// ==========================================

// Global Exception Handler Middleware (must be first in pipeline)
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Small Shop Inventory & Billing API v1");
    c.RoutePrefix = "swagger";
});

// app.UseHttpsRedirection();

app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

// ==========================================
// 3. Database Migration & Startup Seed
// ==========================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        if (app.Configuration.GetValue<bool>("ApplyMigrationsOnStartup", false))
        {
            logger.LogInformation("Applying EF Core database migrations on startup...");
            await dbContext.Database.MigrateAsync();
        }

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        string[] roles = ["Admin", "Staff"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database migration or startup role seeding.");
    }
}

app.Run();

// Make Program accessible for Integration WebApplicationFactory testing
public partial class Program { }
