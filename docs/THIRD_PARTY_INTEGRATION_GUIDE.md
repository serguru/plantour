# Third-Party Integration Guide

This guide provides detailed instructions for integrating third-party applications and services with Plantour.

## Overview

Plantour welcomes third-party integrations that enhance the travel planning experience. This guide covers:
- Setting up your development environment
- Adding third-party packages
- Contributing your integration back to Plantour via GitHub

## Quick Start

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/plantour.git
cd plantour
```

### 2. Set Up Development Environment

**Client (Angular):**
```bash
cd plantour-client
npm install
npm start
```

**Server (.NET):**
```bash
cd plantour-server/api
dotnet restore
dotnet run
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/integration-name
```

## Adding Third-Party Packages

### Client-Side (npm packages)

1. **Install the package:**
   ```bash
   cd plantour-client
   npm install <package-name>
   ```

2. **Install TypeScript types (if available):**
   ```bash
   npm install --save-dev @types/<package-name>
   ```

3. **Import in your code:**
   ```typescript
   import { SomeFeature } from 'package-name';
   ```

### Server-Side (NuGet packages)

1. **Install the package:**
   ```bash
   cd plantour-server/api
   dotnet add package <PackageName>
   ```

2. **Use in your code:**
   ```csharp
   using PackageNamespace;
   ```

## Creating Your Integration

### Client Integration (Angular Service)

Create a new service in `plantour-client/src/app/services/`:

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyService {
  constructor() { }
  
  // Your integration methods
}
```

### Server Integration (C# Service)

Create a new service in `plantour-server/api/Services/`:

```csharp
namespace api.Services
{
    public interface IThirdPartyService
    {
        // Interface methods
    }
    
    public class ThirdPartyService : IThirdPartyService
    {
        // Implementation
    }
}
```

Register in `Program.cs`:
```csharp
builder.Services.AddScoped<IThirdPartyService, ThirdPartyService>();
```

## Testing Your Integration

### Client Tests

```bash
cd plantour-client
npm test
```

### Server Tests

```bash
cd plantour-server/api
dotnet test
```

## Contributing Back to GitHub

### 1. Commit Your Changes

```bash
git add .
git commit -m "Add integration for <service-name>"
```

### 2. Push to Your Fork

```bash
git push origin feature/integration-name
```

### 3. Create Pull Request

1. Go to https://github.com/serguru/plantour
2. Click "Pull requests" → "New pull request"
3. Click "compare across forks"
4. Select your fork and branch
5. Fill in the PR template with:
   - Description of the integration
   - Why it's useful
   - How to configure it
   - Any required environment variables

## Best Practices

### Security

- **Never commit API keys or secrets**
- Use environment variables for configuration
- Add sensitive files to `.gitignore`

### Code Quality

- Follow existing code style
- Add comments for complex logic
- Write unit tests
- Update documentation

### Documentation

Include in your PR:
- README updates if needed
- Configuration instructions
- Example usage
- Required environment variables

### Example .env Configuration

```bash
# .env (gitignored)
THIRD_PARTY_API_KEY=your_api_key_here
THIRD_PARTY_ENDPOINT=https://api.example.com
```

## Common Integration Types

### Map Services

Example: Adding Mapbox integration

```typescript
// plantour-client/src/app/services/mapbox.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  private apiKey = environment.mapboxApiKey;
  
  getDirections(start: string, end: string) {
    // Implementation
  }
}
```

### Weather Services

Example: Adding weather API

```csharp
// plantour-server/api/Services/WeatherService.cs
public class WeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    
    public async Task<WeatherData> GetWeather(string location)
    {
        // Implementation
    }
}
```

### Cloud Storage

Example: Adding file upload service

```typescript
// plantour-client/src/app/services/storage.service.ts
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  uploadFile(file: File): Observable<string> {
    // Implementation
  }
}
```

## Troubleshooting

### Package Installation Issues

- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

### Build Errors

- Ensure all dependencies are installed
- Check for TypeScript errors: `npm run build`
- Verify .NET version: `dotnet --version`

### Git Issues

**Changes not showing in PR:**
```bash
git status  # Check what's staged
git add .   # Stage all changes
git commit -m "Your message"
git push origin your-branch-name
```

**Update fork with latest changes:**
```bash
git remote add upstream https://github.com/serguru/plantour.git
git fetch upstream
git merge upstream/main
```

## Need Help?

- Review [CONTRIBUTING.md](../CONTRIBUTING.md)
- Check [FAQ](FAQ.md)
- Search existing issues on GitHub
- Open a new issue with the "question" label

## Examples

See the following existing integrations as examples:
- Supabase Auth: `plantour-server/api/Services/SupabaseAuthService.cs`
- JWT Interceptor: `plantour-client/src/app/interceptors/jwt.interceptor.ts`
- User Service: `plantour-client/src/app/services/users-service.ts`
