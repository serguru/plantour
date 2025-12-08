# ListActionsComponent

A flexible Angular component for filtering and sorting data lists with PrimeNG UI components.

## Features

- **Lookup Filters**: Filter by predefined values using dropdown selects
- **Text Search**: Search across filterable properties (case-insensitive)
- **Sorting**: Sort by any sortable property (ascending/descending/none)
- **Type-aware Sorting**: Handles both string and numeric sorting
- **AND Logic**: All filter conditions are combined with AND logic
- **Event Emission**: Emits processed data whenever filters or sorting change

## Installation

The component is standalone and requires:
- Angular 20.x
- PrimeNG 20.x
- FormsModule

## Usage

### Basic Example

```typescript
import { ListActionsComponent, PropertyConfig } from './components/list-actions';

@Component({
  // ...
  imports: [ListActionsComponent]
})
export class MyComponent {
  data = [
    { name: 'Tom', category: 'Engineer', age: 30, status: 'Active' },
    { name: 'Alice', category: 'Doctor', age: 26, status: 'Invited' }
  ];

  configuration: PropertyConfig[] = [
    {
      property: 'name',
      config: {
        lookup: false,
        filter: true,
        sorting: 'text'
      }
    },
    {
      property: 'category',
      config: {
        lookup: true,
        'lookup-list': ['Engineer', 'Doctor', 'Scientist'],
        filter: true,
        sorting: 'string'
      }
    },
    {
      property: 'age',
      config: {
        lookup: false,
        filter: false,
        sorting: 'number'
      }
    }
  ];

  filteredData = [...this.data];

  onDataChanged(processedData: any[]) {
    this.filteredData = processedData;
  }
}
```

### Template

```html
<app-list-actions
  [data]="data"
  [configuration]="configuration"
  (dataChanged)="onDataChanged($event)">
</app-list-actions>

<!-- Display filtered results -->
<div *ngFor="let item of filteredData">
  {{ item | json }}
</div>
```

## Configuration

### PropertyConfig Interface

```typescript
interface PropertyConfig {
  property: string;  // Property name from data object
  config: {
    lookup?: boolean;           // Show as dropdown filter
    'lookup-list'?: string[];   // Values for lookup dropdown
    filter?: boolean;           // Include in text search
    sorting?: 'text' | 'string' | 'number' | 'none';  // Sorting type
  };
}
```

### Configuration Options

- **lookup**: If `true`, creates a dropdown filter for this property
- **lookup-list**: Array of values for the lookup dropdown
- **filter**: If `true`, property is included in text search
- **sorting**: 
  - `'text'` or `'string'`: Alphabetical sorting (case-insensitive)
  - `'number'`: Numeric sorting
  - `'none'`: Property cannot be sorted

## Demo

Access the demo component at `/list-actions-demo` to see the component in action.

To run the demo:
```bash
npm start
```
Then navigate to `http://localhost:4200/list-actions-demo`

## API

### Inputs

| Input | Type | Description |
|-------|------|-------------|
| data | any[] | Array of objects to filter and sort |
| configuration | PropertyConfig[] | Configuration for each property |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| dataChanged | EventEmitter<any[]> | Emits processed data when filters/sorting change |

### Methods

| Method | Description |
|--------|-------------|
| resetFilters() | Clears all filters and sorting |

## Filtering Behavior

1. **Lookup filters**: Exact match (case-insensitive for strings)
2. **Text filter**: Searches across all filterable properties using contains logic
3. **Multiple filters**: Combined with AND logic
4. **Sorting**: Applied after all filters, only one field at a time

## Example Configuration

```typescript
const config: PropertyConfig[] = [
  {
    property: 'status',
    config: {
      lookup: true,
      'lookup-list': ['Active', 'Invited', 'Banned'],
      filter: true,
      sorting: 'none'
    }
  },
  {
    property: 'age',
    config: {
      lookup: false,
      filter: false,
      sorting: 'number'
    }
  }
];
```
