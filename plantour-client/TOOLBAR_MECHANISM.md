# Dynamic Toolbar Button Mechanism

## Overview
A dynamic toolbar button management system has been implemented that allows components to add and remove buttons in the toolbar based on the currently active route. **Buttons are reactive and respond to component state changes.**

## Architecture

### 1. ToolbarService (`shared-lib/src/services/toolbar-service.ts`)
A centralized service that manages toolbar buttons:

```typescript
export interface ToolbarButton {
  id?: string;            // Unique identifier for reactive updates
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
- `updateButton(buttonId, updates)` - **Update a specific button** ⭐
- `updateButtons(updates)` - **Update multiple buttons at once** ⭐

### 2. ToolbarAware (`mobile-app/src/app/components/toolbar-aware.ts`)
An abstract base class for components that want to add toolbar buttons:

```typescript
abstract class ToolbarAware implements OnDestroy {
  protected toolbarService = inject(ToolbarService);
  
  // Automatically clears buttons when component is destroyed
  ngOnDestroy(): void
  
  // Helper methods for derived components
  protected setToolbarButtons(buttons: ToolbarButton[]): void
  protected clearToolbarButtons(): void
  protected updateToolbarButton(buttonId: string, updates: Partial<ToolbarButton>): void ⭐
  protected updateToolbarButtons(updates: { [buttonId: string]: Partial<ToolbarButton> }): void ⭐
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

### ThingsComponent - Reactive Buttons ⭐

**Step 1: Setup buttons with IDs**

```typescript
private setupToolbarButtons(): void {
  this.setToolbarButtons([
    {
      id: 'add-thing',
      icon: 'pi pi-plus',
      tooltip: 'Add Thing',
      command: () => this.onAddThing()
    },
    {
      id: 'edit-thing',          // ID allows reactive updates
      icon: 'pi pi-pencil',
      tooltip: 'Edit Thing',
      command: () => this.onEditSelectedThing(),
      disabled: true             // Initially disabled
    },
    {
      id: 'delete-thing',
      icon: 'pi pi-trash',
      tooltip: 'Delete Thing',
      command: () => this.onDeleteSelectedThing(),
      disabled: true
    },
    {
      id: 'refresh-things',
      icon: 'pi pi-refresh',
      tooltip: 'Refresh',
      command: () => this.loadUserThings()
    }
  ]);
}
```

**Step 2: React to component state changes**

```typescript
onSelectionChange(): void {
  const hasSelection = this.selectedThing != null;
  
  // Update button states reactively
  this.updateToolbarButtons({
    'edit-thing': { 
      disabled: !hasSelection,
      tooltip: hasSelection ? `Edit "${this.selectedThing?.shortDescription}"` : 'Edit Thing'
    },
    'delete-thing': { 
      disabled: !hasSelection,
      tooltip: hasSelection ? `Delete "${this.selectedThing?.shortDescription}"` : 'Delete Thing'
    }
  });
}
```

**Step 3: Connect to UI**

```html
<p-listbox 
  [options]="userThings!" 
  [(ngModel)]="selectedThing"
  (onChange)="onSelectionChange()"    <!-- Triggers button updates -->
  optionLabel="shortDescription">
```

**Step 4: Commands execute in component context**

```typescript
onEditSelectedThing(): void {
  if (this.selectedThing) {
    // Button "knows" which item is selected via component context
    this.router.navigate(['/things/edit', this.selectedThing.id]);
  }
}
```

## How Reactive Buttons Work

### Data Flow
```
1. User selects item in listbox
   ↓
2. (onChange) event fires
   ↓
3. onSelectionChange() is called
   ↓
4. Component calls updateToolbarButtons()
   ↓
5. ToolbarService updates BehaviorSubject
   ↓
6. Toolbar component receives update via buttons$
   ↓
7. Angular updates DOM
   ↓
8. Buttons visually change state (enabled/disabled, new tooltips)
```

### Context Awareness via Closures

```typescript
// Arrow function captures component context
command: () => this.onEditSelectedThing()
//            ^^^^ 'this' refers to component instance

// Inside onEditSelectedThing():
if (this.selectedThing) {
  // Has access to selectedThing from component scope
  this.router.navigate(['/things/edit', this.selectedThing.id]);
}
```

The command function is a closure that captures the component's `this` context, giving it access to:
- `this.selectedThing` - currently selected item
- `this.router` - injected services
- All component methods and properties

## Updated Components

All routed components have been updated with reactive buttons:

1. ✅ **ThingsComponent** - Add, Edit, Delete, Refresh (Edit/Delete react to selection)
2. ✅ **PacksComponent** - Add, Edit, Delete, Refresh (Edit/Delete react to selection)  
3. ✅ **TripComponent** - Add, Edit, Delete, Refresh (Edit/Delete react to selection)
4. ✅ **TravelersComponent** - Add Traveler
5. ✅ **LandingNewUserComponent** - (no buttons)
6. ✅ **LandingRegisteredUserComponent** - (no buttons)
7. ✅ **SignInComponent** - (no buttons)
8. ✅ **RegisterUserComponent** - (no buttons)

## Benefits

1. **Reactive State Management**: Buttons automatically sync with component state
2. **Context-Aware Commands**: Button commands execute in component context with full access to component data
3. **Type-Safe**: TypeScript ensures correct button configuration
4. **Automatic Cleanup**: No manual cleanup needed, handled by base class
5. **Dynamic Tooltips**: Tooltips update with contextual information (e.g., selected item name)
6. **Error Prevention**: Buttons disabled when action is not possible
7. **Clean Code**: Declarative button updates instead of imperative DOM manipulation
8. **Performance**: BehaviorSubject efficiently manages subscriptions and updates

## Testing

Navigate through the application:

1. Go to `/things` - Click an item to see Edit/Delete buttons become enabled
2. Deselect - Buttons become disabled again
3. Select different items - Tooltips update with item names
4. Same behavior in `/packs` and `/trips`

## Advanced Scenarios

### Multiple conditions
```typescript
onSelectionChange(): void {
  const hasSelection = this.selectedThing != null;
  const canEdit = hasSelection && this.hasEditPermission();
  
  this.updateToolbarButtons({
    'edit-thing': { 
      disabled: !canEdit,
      tooltip: canEdit ? `Edit "${this.selectedThing?.shortDescription}"` : 'No permission'
    }
  });
}
```

### Dynamic icons
```typescript
this.updateToolbarButton('toggle-archive', { 
  icon: isArchived ? 'pi pi-inbox' : 'pi pi-archive',
  tooltip: isArchived ? 'Unarchive' : 'Archive'
});
```

### Loading states
```typescript
onDataLoading(loading: boolean): void {
  this.updateToolbarButton('refresh', { 
    disabled: loading,
    icon: loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'
  });
}
```
