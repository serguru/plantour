# Dynamic Toolbar Button Mechanism

## Overview
A dynamic toolbar button management system has been implemented that allows components to add and remove buttons in the toolbar based on the currently active route.

## Architecture

### 1. ToolbarService (`shared-lib/src/services/toolbar-service.ts`)
A centralized service that manages toolbar buttons:

```typescript
export interface ToolbarButton {
  icon: string;           // PrimeNG icon class
  label?: string;         // Optional button label
  tooltip?: string;       // Optional tooltip text
  command: () => void;    // Click handler
  disabled?: boolean;     // Optional disabled state
}
```

**Key methods:**
- `setButtons(buttons: ToolbarButton[])` - Set the current toolbar buttons
- `clearButtons()` - Remove all buttons
- `getButtons()` - Get current buttons
- `buttons$` - Observable stream of button changes

### 2. ToolbarAware (`mobile-app/src/app/components/toolbar-aware.ts`)
An abstract base class for components that want to add toolbar buttons:

```typescript
abstract class ToolbarAware implements OnDestroy {
  protected toolbarService = inject(ToolbarService);
  
  // Automatically clears buttons when component is destroyed
  ngOnDestroy(): void {
    this.toolbarService.clearButtons();
  }
  
  // Helper methods for derived components
  protected setToolbarButtons(buttons: ToolbarButton[]): void
  protected clearToolbarButtons(): void
}
```

### 3. Toolbar Component Updates
The toolbar component subscribes to button changes and displays them in the center:

```html
<div class="toolbar-center">
  @for (button of dynamicButtons; track $index) {
    <button 
      pButton 
      [icon]="button.icon"
      [label]="button.label || ''"
      [pTooltip]="button.tooltip || ''"
      [disabled]="button.disabled || false"
      class="p-button-text p-button-rounded dynamic-button"
      (click)="button.command()">
    </button>
  }
</div>
```

## Implementation Examples

### ThingsComponent
Adds "Add Thing" and "Refresh" buttons:

```typescript
export class ThingsComponent extends ToolbarAware implements OnInit {
  ngOnInit(): void {
    this.loadUserThings();
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        icon: 'pi pi-plus',
        tooltip: 'Add Thing',
        command: () => this.onAddThing()
      },
      {
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadUserThings()
      }
    ]);
  }
}
```

### PacksComponent
Adds "Add Pack" and "Refresh" buttons:

```typescript
export class PacksComponent extends ToolbarAware implements OnInit {
  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        icon: 'pi pi-plus',
        tooltip: 'Add Pack',
        command: () => this.onAddPack()
      },
      {
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadUserPackages()
      }
    ]);
  }
}
```

### TripComponent
Adds "Add Trip" and "Refresh" buttons:

```typescript
export class TripComponent extends ToolbarAware implements OnInit {
  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        icon: 'pi pi-plus',
        tooltip: 'Add Trip',
        command: () => this.onAddTrip()
      },
      {
        icon: 'pi pi-refresh',
        tooltip: 'Refresh',
        command: () => this.loadTrips()
      }
    ]);
  }
}
```

### TravelersComponent
Adds "Add Traveler" button:

```typescript
export class TravelersComponent extends ToolbarAware implements OnInit {
  private setupToolbarButtons(): void {
    this.setToolbarButtons([
      {
        icon: 'pi pi-user-plus',
        tooltip: 'Add Traveler',
        command: () => console.log('Add traveler clicked')
      }
    ]);
  }
}
```

## Updated Components

All routed components have been updated to extend `ToolbarAware`:

1. ✅ **ThingsComponent** - /things
2. ✅ **PacksComponent** - /packs  
3. ✅ **TripComponent** - /trips
4. ✅ **TravelersComponent** - /travelers
5. ✅ **LandingNewUserComponent** - / (new user)
6. ✅ **LandingRegisteredUserComponent** - / (registered user)
7. ✅ **SignInComponent** - /sign-in
8. ✅ **RegisterUserComponent** - /register

## Lifecycle Management

**Automatic Cleanup:** When a component is destroyed (navigating away), the `ToolbarAware.ngOnDestroy()` automatically clears its buttons from the toolbar.

**No Memory Leaks:** The toolbar component subscribes to `ToolbarService.buttons$` and properly unsubscribes using `takeUntil(destroy$)`.

## Styling

Dynamic buttons are styled with the `.dynamic-button` class:

```scss
.dynamic-button {
  color: white !important;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
}
```

The buttons appear in the center section of the toolbar with flexbox layout:

```scss
.toolbar-center {
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: center;
}
```

## Testing

To test the mechanism:

1. Navigate to `/things` - observe "Add" and "Refresh" buttons appear
2. Navigate to `/packs` - observe buttons change to "Add Pack" and "Refresh"
3. Navigate to `/trips` - observe buttons change to "Add Trip" and "Refresh"
4. Navigate to `/travelers` - observe only "Add Traveler" button appears
5. Navigate to landing pages or auth pages - observe no buttons (or different buttons if configured)

## Benefits

1. **Decoupled:** Components don't need to know about toolbar implementation
2. **Type-Safe:** TypeScript interfaces ensure correct button configuration
3. **Automatic Cleanup:** No manual cleanup needed, handled by base class
4. **Flexible:** Each component can define its own buttons with custom actions
5. **Context-Aware:** Buttons execute commands in the context of the active component
6. **Reusable:** The pattern can be easily extended to other components

## Future Enhancements

Possible improvements:
- Button grouping/sections
- Button badges (e.g., notification counts)
- Conditional button visibility based on permissions
- Button state management (loading, disabled)
- Button animations
