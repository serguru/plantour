# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["pack-api.csproj", "."]
RUN dotnet restore "./pack-api.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./pack-api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./pack-api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# At container start set ASPNETCORE_URLS to use the runtime $PORT (falls back to 8080)
ENTRYPOINT ["sh", "-c", "export ASPNETCORE_URLS=\"http://*:${PORT:-8080}\" && exec dotnet pack-api.dll"]