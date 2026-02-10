# Contributing to Plantour

Thank you for your interest in contributing to Plantour! This document provides guidelines for contributing to the project, including how to integrate third-party applications and services.

## Table of Contents

- [Getting Started](#getting-started)
- [Third-Party Integrations](#third-party-integrations)
- [Submitting Contributions](#submitting-contributions)
- [Code Standards](#code-standards)

## Getting Started

Plantour is a travel planning Progressive Web Application (PWA) built with:
- **Frontend**: Angular 20 with PrimeNG
- **Backend**: .NET 10 (C#)
- **Authentication**: Supabase Auth
- **Database**: MS SQL

## Third-Party Integrations

### Adding Third-Party Applications

If you want to integrate a third-party application or service with Plantour:

1. **Review the Integration**
   - Ensure the third-party app aligns with Plantour's purpose
   - Verify licensing compatibility
   - Check security requirements

2. **Client-Side Integration (Angular)**
   - Add dependencies via npm:
     ```bash
     cd plantour-client
     npm install <package-name>
     ```
   - Create a service in `plantour-client/src/app/services/`
   - Document the integration in the service file

3. **Server-Side Integration (.NET)**
   - Add NuGet packages to the project:
     ```bash
     cd plantour-server/api
     dotnet add package <PackageName>
     ```
   - Create services in `plantour-server/api/Services/`
   - Add controllers if needed in `plantour-server/api/Controllers/`

### Returning/Contributing Third-Party App Code

If you've developed a third-party application that integrates with Plantour:

1. **Fork the Repository**
   ```bash
   # Fork via GitHub UI, then:
   git clone https://github.com/YOUR-USERNAME/plantour.git
   cd plantour
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-integration-name
   ```

3. **Add Your Integration**
   - Place client code in appropriate directories under `plantour-client/src/app/`
   - Place server code in appropriate directories under `plantour-server/api/`
   - Update documentation

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add integration for <app-name>"
   git push origin feature/your-integration-name
   ```

5. **Create Pull Request**
   - Go to GitHub and create a PR from your fork
   - Provide detailed description of the integration
   - Include any configuration requirements

## Submitting Contributions

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure your code follows the existing code style
3. Test your changes thoroughly
4. Update documentation as needed
5. The PR will be reviewed by maintainers

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove)
- Keep the first line under 72 characters

## Code Standards

### Angular Client

- Use standalone components
- Follow Angular style guide
- Use PrimeNG components for UI
- Separate code, HTML, and SCSS into different files

### .NET Server

- Follow C# coding conventions
- Use dependency injection
- Implement proper error handling
- Add XML documentation comments

### General

- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Write unit tests for new features

## Questions?

If you have questions about contributing or integrating third-party applications, please:
1. Check existing documentation
2. Search closed issues for similar questions
3. Open a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
