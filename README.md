# Plantour

A portal that helps you plan, prepare, and execute your trip. This service facilitates group interactions between travelers, helps track expenses, take notes, create packing lists, create itineraries, and plan stays at specific destinations.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Features

- **Trip Planning**: Create and manage tours from scratch or using templates
- **Itinerary Management**: Plan activities and track time periods
- **Expense Tracking**: Monitor and estimate travel expenses
- **Packing Lists**: Create and manage checklists for your trips
- **Notes**: Take rich text notes with media support
- **Group Collaboration**: Invite family and friends to join tours
- **Offline Mode**: Progressive Web App with offline capabilities

## Technology Stack

### Frontend (plantour-client)
- Angular 20
- PrimeNG UI Components
- TypeScript
- Progressive Web App (PWA)

### Backend (plantour-server)
- .NET 10 (C#)
- MS SQL Database
- Supabase Authentication
- REST API

## Getting Started

### Prerequisites

- Node.js and npm (for client)
- .NET 10 SDK (for server)
- MS SQL Server

### Client Setup

```bash
cd plantour-client
npm install
npm start
```

### Server Setup

```bash
cd plantour-server/api
dotnet restore
dotnet run
```

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or integrating third-party applications:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

For detailed guidelines on contributing and integrating third-party applications, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [Technical Specifications](documents/plantour-spec.txt) - Detailed project specifications
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute and integrate third-party apps
- [Third-Party Integration Guide](docs/THIRD_PARTY_INTEGRATION_GUIDE.md) - Step-by-step guide for integrating third-party services
- [FAQ](docs/FAQ.md) - Frequently asked questions about contributing and integrations
- [Client Documentation](plantour-client/README.md) - Angular client specific information

## License

This is a private project. All rights reserved.
