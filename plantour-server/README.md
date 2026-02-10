# PlantourServer

This API supports 3 environments: **dev** (local), **qa**, and **production**.

## Environment selection

At runtime, the server reads `ASPNETCORE_ENVIRONMENT` (or `DOTNET_ENVIRONMENT`) and normalizes it:

- `dev` → ASP.NET Core `Development`
- `qa` → `QA`
- `production` → ASP.NET Core `Production`

This keeps existing `IsDevelopment()` / `IsProduction()` checks working while letting you use the names `dev`, `qa`, `production` in deploy scripts.

## Local dev

The VS launch profiles already set `ASPNETCORE_ENVIRONMENT=dev`.

From a terminal:

```bash
set ASPNETCORE_ENVIRONMENT=dev
set ASPNETCORE_URLS=http://0.0.0.0:5217

dotnet run
```

## QA deploy

Set the environment to `qa`:

```bash
set ASPNETCORE_ENVIRONMENT=qa
```

Configuration overrides can be placed in `appsettings.QA.json`.

## Production deploy

Set the environment to `production`:

```bash
set ASPNETCORE_ENVIRONMENT=production
```

Configuration overrides can be placed in `appsettings.Production.json`.

## Config files

ASP.NET Core loads:

- `appsettings.json` (base)
- `appsettings.{Environment}.json` (e.g. `appsettings.Development.json`, `appsettings.QA.json`, `appsettings.Production.json`)

You typically set secrets and connection strings via environment variables in QA/production.
