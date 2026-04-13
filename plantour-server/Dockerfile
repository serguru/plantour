# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 10000
ENV PORT=10000
ENV ASPNETCORE_HTTP_PORTS=10000


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["plantour-server/plantour-server.csproj", "plantour-server/"]
COPY ["plantour-shared-db/plantour-shared-db.csproj", "plantour-shared-db/"]
RUN dotnet restore "./plantour-server/plantour-server.csproj"
COPY plantour-server/. ./plantour-server/
COPY plantour-shared-db/. ./plantour-shared-db/
WORKDIR "/src/plantour-server"
RUN dotnet build "./plantour-server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./plantour-server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app

# added 3 lines as AI suggested to be able to use tunnel access  to production while in maintenance
RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN usermod --unlock root
# ------------------------------


COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "plantour_server.dll"]