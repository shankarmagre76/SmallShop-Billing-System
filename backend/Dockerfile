# Stage 1: Base ASP.NET Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Stage 2: SDK Image for Restore & Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["SmallShopInventoryBillingAPI.csproj", "."]
RUN dotnet restore "SmallShopInventoryBillingAPI.csproj"
COPY . .
RUN dotnet build "SmallShopInventoryBillingAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish App
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "SmallShopInventoryBillingAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final Image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SmallShopInventoryBillingAPI.dll"]
