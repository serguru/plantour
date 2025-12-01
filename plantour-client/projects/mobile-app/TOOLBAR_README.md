# Toolbar Implementation - Mobile App

## Overview
Added a complete toolbar control to the mobile-app component with the following features:

### Features Implemented

1. **Logo and Title (Center)**
   - Plantour logo (map marker icon) and "Plantour" text
   - Clickable - redirects to landing page (/)
   - Responsive hover effect

2. **Dynamic Back Button (Left)**
   - Shows/hides automatically based on current route
   - Smart navigation logic:
     - Hidden on landing page (/)
     - Visible on other pages with appropriate back path
     - For edit forms (e.g., /items/edit/1) - navigates back to list (/items)
     - For detail views - navigates back to list
     - Custom back paths can be set programmatically
   - **Important**: Does NOT duplicate browser's back button - uses logical navigation paths

3. **Hamburger Menu (Right)**
   - Hamburger icon (three horizontal lines)
   - Popup menu with the following items:
     - Profile
     - Help
     - Terms of Usage
     - Privacy Policy
     - Contact Us
     - Sign In/Sign Out (separator before this)
   - Currently shows placeholders (console.log) - routes to be implemented later

## Files Created

### 1. Navigation Service
**Path**: `projects/mobile-app/src/app/services/navigation.service.ts`

Manages the state of the toolbar navigation:
- Tracks whether back button should be shown
- Determines appropriate back path based on current route
- Provides methods to navigate back or set custom back paths
- Automatically updates on route changes

### 2. Toolbar Component
**Path**: `projects/mobile-app/src/app/components/toolbar/`

Files:
- `toolbar.ts` - Component logic
- `toolbar.html` - Template
- `toolbar.scss` - Styles

Features:
- Responsive design (mobile-optimized)
- Uses PrimeNG components (Menu, Button)
- Subscribes to navigation state changes
- Handles all user interactions

### 3. Updated App Component
**Path**: `projects/mobile-app/src/app/app.ts` & `app.html`

- Imported and added Toolbar component
- Wrapped router-outlet with proper layout structure

## Usage

### Basic Usage
The toolbar is automatically displayed on all pages. No additional configuration needed.

### Custom Back Navigation
If you need to set a custom back path from a component:

```typescript
import { NavigationService } from '../../services/navigation.service';

constructor(private navigationService: NavigationService) {}

ngOnInit() {
  // Set custom back path
  this.navigationService.setCustomBackPath('/custom/path', true);
}
```

### Hide Back Button
```typescript
this.navigationService.setCustomBackPath('/', false);
```

## Navigation Logic

The NavigationService automatically determines the back path based on these rules:

1. **Landing page (`/`)**: Back button hidden
2. **Register page (`/register`)**: Back to `/`
3. **Edit forms (`.../edit/...`)**: Back to parent list page
4. **Detail views (`.../detail/...` or `.../view/...`)**: Back to parent list page
5. **Other pages**: Back to `/`

## Extending the Menu

To add more menu items, edit `toolbar.ts`:

```typescript
menuItems: MenuItem[] = [
  {
    label: 'New Item',
    icon: 'pi pi-plus',
    command: () => this.navigateTo('/new-path')
  },
  // ... existing items
];
```

## Styling

The toolbar uses:
- Primary color from CSS variables (`--primary-color`)
- Fallback color: `#3b82f6` (blue)
- Sticky positioning (stays at top when scrolling)
- Mobile-responsive padding and font sizes

To customize colors, update your theme or the toolbar.scss file.

## Dependencies

- PrimeNG Menu module
- PrimeNG Button module
- Angular Router
- RxJS

All dependencies are already included in the project.

## Testing

The implementation has been built successfully. To test:

```bash
npm run m  # Starts mobile-app dev server
```

Then navigate to the application and test:
- Click logo/title to go to landing page
- Navigate to /register to see back button appear
- Click hamburger menu to see menu items
- Test back button navigation

## Future Enhancements

1. Implement actual routes for menu items (Profile, Help, etc.)
2. Add authentication state to show Sign In vs Sign Out
3. Add user avatar in menu when logged in
4. Add notifications/alerts indicator
5. Implement breadcrumb navigation for deeper paths
