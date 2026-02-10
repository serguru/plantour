# Frequently Asked Questions (FAQ)

## General Questions

### What is Plantour?

Plantour is a Progressive Web Application (PWA) that helps travelers plan, organize, prepare, conduct, store, and reuse tours. It works both online and offline on any platform including Windows, Android, and iOS.

### What technologies does Plantour use?

- **Frontend**: Angular 20 with PrimeNG UI components
- **Backend**: .NET 10 (C#) with REST API
- **Database**: MS SQL Server
- **Authentication**: Supabase Auth
- **Progressive Web App**: Offline-capable

## Contributing and GitHub

### How do I contribute to Plantour?

1. Fork the repository on GitHub
2. Clone your fork to your local machine
3. Create a new feature branch
4. Make your changes
5. Commit and push to your fork
6. Create a Pull Request on GitHub

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed instructions.

### How do I return or contribute a third-party app to Plantour?

If you've developed a third-party application or integration:

1. **Fork the Repository**: Click "Fork" on GitHub to create your own copy
2. **Clone Your Fork**: 
   ```bash
   git clone https://github.com/YOUR-USERNAME/plantour.git
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-integration-name
   ```
4. **Add Your Code**: Place your integration in the appropriate directories
   - Client code goes in `plantour-client/src/app/`
   - Server code goes in `plantour-server/api/`
5. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "Add integration for <app-name>"
   ```
6. **Push to Your Fork**:
   ```bash
   git push origin feature/your-integration-name
   ```
7. **Create Pull Request**: Go to the original repository on GitHub and click "New Pull Request"

### How do I integrate a third-party npm package?

For client-side integrations:

```bash
cd plantour-client
npm install <package-name>
npm install --save-dev @types/<package-name>  # if TypeScript types are available
```

Then import and use in your Angular services or components.

### How do I integrate a third-party NuGet package?

For server-side integrations:

```bash
cd plantour-server/api
dotnet add package <PackageName>
```

Then use in your controllers or services.

## Working with the Codebase

### Where should I add new features?

- **Frontend features**: `plantour-client/src/app/components/`
- **Backend features**: `plantour-server/api/Controllers/`
- **Services**: `plantour-client/src/app/services/` or `plantour-server/api/Services/`
- **Shared types**: `plantour-client/src/app/models/` or `plantour-server/api/Models/`

### How do I test my changes?

**Client**:
```bash
cd plantour-client
npm test
```

**Server**:
```bash
cd plantour-server/api
dotnet test
```

### What should I include in my Pull Request?

- Clear description of what the changes do
- Why the changes are needed
- Any breaking changes
- Screenshots for UI changes
- Updated documentation if applicable
- Tests for new functionality

## Third-Party Integrations

### What types of third-party integrations are welcome?

We welcome integrations that enhance the travel planning experience:
- Map services (beyond Google Maps)
- Weather services
- Translation services
- Currency conversion
- Travel booking APIs
- Social media sharing
- Cloud storage (for media files)

### Are there any restrictions on third-party dependencies?

- Must have compatible licenses (preferably MIT, Apache 2.0, or similar)
- Should be actively maintained
- Must not introduce security vulnerabilities
- Should have reasonable bundle size impact

### How do I handle API keys for third-party services?

- Never commit API keys to the repository
- Use environment variables for configuration
- Document required environment variables in your PR
- For local development, use `.env` files (which are gitignored)

## Troubleshooting

### My changes aren't showing up in the PR

Make sure you:
1. Committed your changes: `git commit -m "Your message"`
2. Pushed to your fork: `git push origin your-branch-name`
3. Created the PR from your fork to the original repository

### How do I update my fork with latest changes?

```bash
# Add the original repository as upstream
git remote add upstream https://github.com/serguru/plantour.git

# Fetch latest changes
git fetch upstream

# Merge into your branch
git checkout main
git merge upstream/main
```

### I have other questions not covered here

Please:
1. Check the [CONTRIBUTING.md](../CONTRIBUTING.md) guide
2. Review the [technical specifications](../documents/plantour-spec.txt)
3. Search existing GitHub issues
4. Open a new issue with the "question" label

## Contact

For more information or questions, please open an issue on GitHub.
