# Help Component - Table of Contents

## Overview
This is the main Help component for Plantour application. It displays a comprehensive table of contents for the entire Help system, allowing users to navigate to different help topics.

## Location
`src/app/components/help/help-component.ts`

## Features

### 1. Get Started Section (No Registration Required)
- Highlighted at the top with a special call-to-action
- Allows users to try Plantour with test data
- Includes:
  - Welcome to Plantour
  - Using Test Mode
  - Quick 5-minute tour
  - Creating an account

### 2. Structured Help Topics
The help system is organized into the following main sections:

- **Plantour Overview** - Introduction and key concepts
- **Account Management** - Registration, login, profile
- **Travelers Module** - Managing travelers (6 topics)
- **Things Module** - Managing packing items (6 topics)
- **Packs Module** - Managing luggage/packages (5 topics)
- **Trips Module** - Creating and managing trips (7 topics)
- **Trip Participants** - Adding people to trips (4 topics)
- **Trip Packing Lists** - Managing trip things (5 topics)
- **Trip Packages** - Assigning luggage (4 topics)
- **Shared Things** - Shared items between participants (4 topics)
- **Trip Comments** - Collaboration features (4 topics)
- **Target Mode** - Advanced feature for trip context (6 topics)
- **Filtering and Sorting** - Finding items quickly (4 topics)
- **Templates** - Reusable items and structures (3 topics)
- **Tips & Best Practices** - Getting the most from Plantour (4 topics)
- **Troubleshooting** - Common issues and solutions (4 topics)
- **FAQ** - Frequently asked questions (5 categories)

### 3. Contextual Link IDs
Each subtopic has a `linkId` (e.g., `link#1`, `link#2`) that will be used to create contextual help buttons throughout the application.

### 4. Interactive Features
- Accordion-style sections that can expand/collapse
- Clickable subsections (navigation placeholder)
- "Start Test Mode" button for trying the app without registration
- "Contact Support" and "Report an Issue" actions

## Usage

### Accessing Help
Users can access Help from the main toolbar menu (Features → Help).

### Navigation Structure
```
Help Component
├── Get Started (Highlighted)
│   ├── Welcome to Plantour
│   ├── Using Test Mode
│   ├── Quick Tour
│   └── Create Account
├── Overview
├── Account Management
├── Module-Specific Help (Travelers, Things, Packs, Trips)
├── Trip-Related Features
├── Advanced Features
├── Tips & Troubleshooting
└── FAQ
```

## Styling
The component uses existing styles from `styles.scss` with minimal custom styles:
- `.help-container` - Main layout
- `.help-header` - Title and subtitle
- `.get-started-highlight` - Special highlight box
- `.subsection-list` - List of help topics
- `.contextual-link-badge` - Display link IDs

## Next Steps
1. Create individual help content components for each section
2. Implement navigation between sections
3. Add contextual help buttons throughout the app
4. Create screenshots and placeholder images
5. Write detailed step-by-step instructions for each topic

## Total Help Topics
- **Main Sections**: 18
- **Subsections**: 74+
- **Contextual Links**: 74+ link IDs for integration

## File Structure
```
src/app/components/help/
├── help-component.ts          # Main table of contents component
├── help-component.html        # Template
├── help-component.scss        # Styles
├── HELP_SYSTEM_PLAN.md       # Complete implementation plan
└── README.md                 # This file
```

## Integration
The Help route is available at `/help` and is accessible to all users (no authentication required for viewing help).

Route configuration in `app.routes.ts`:
```typescript
{
  path: 'help',
  loadComponent: () => import('./components/help/help-component').then(m => m.HelpComponent),
  resolve: { cleanup: CleanupResolver },
  data: { componentId: 'help' }
}
```
