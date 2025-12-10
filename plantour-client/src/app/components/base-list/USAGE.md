# BaseListComponent Usage Guide

## Overview
BaseListComponent is a generic, reusable component for displaying lists of entities with customizable templates for different entity types.

## Features
- Generic type support for any entity type T
- Custom item templates passed via `@Input()`
- Automatic CRUD operations through injected service
- Responsive design with PrimeNG ListBox

## Basic Usage

### 1. Define Your Entity Type
```typescript
interface Person {
  id: string;
  name: string;
}
```

### 2. Create a CRUD Service
```typescript
export class PersonService extends CrudService<Person, Person, Person> {
  // Implement abstract methods
}
```

### 3. Use in Parent Component
```typescript
@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [BaseListComponent],
  template: `
    <app-generic-list
      [service]="personService"
      [itemTemplate]="personTemplate"
      title="People"
      entityIcon="pi-users">
    </app-generic-list>

    <ng-template #personTemplate let-item>
      <div class="person-item">
        <strong>{{ item.name }}</strong>
      </div>
    </ng-template>
  `
})
export class PeopleListComponent {
  personService = inject(PersonService);
}
```

## Component Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `service` | `CrudService<T, TA, TU>` | Yes | The service handling data operations |
| `itemTemplate` | `TemplateRef<any>` | Yes | Template for rendering each list item |
| `title` | `string \| null` | No | Header title for the list |
| `entityIcon` | `string \| null` | No | PrimeNG icon class for the header |

## Template Context

The `itemTemplate` receives the current item through the implicit context variable:

```html
<ng-template #itemTemplate let-item>
  <!-- 'item' is the current entity of type T -->
  {{ item.property }}
</ng-template>
```

## Examples

### Example 1: Color List
```typescript
interface Color {
  id: string;
  color: string;
}

// In component template:
<ng-template #colorTemplate let-item>
  <div class="color-item">
    <span class="color-swatch" 
          [style.background-color]="item.color">
    </span>
    <span>{{ item.color }}</span>
  </div>
</ng-template>
```

### Example 2: Product List
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
}

// In component template:
<ng-template #productTemplate let-item>
  <div class="product-item">
    <span>{{ item.name }}</span>
    <span class="price">\${{ item.price | number:'1.2-2' }}</span>
  </div>
</ng-template>
```

## Running Tests

See `base-list-test.component.ts` for a complete working example with three different entity types (Person, Color, Product).

To run the test component, add it to your routing:
```typescript
{
  path: 'base-list-test',
  component: BaseListTestComponent
}
```

Then navigate to `/base-list-test` in your browser.
