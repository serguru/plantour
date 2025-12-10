import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BaseListComponent } from '../base-list/base-list';
import { CrudService } from '../../services/crud-service';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Test entities
interface Person {
  id: string;
  name: string;
}

interface Color {
  id: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

// Mock services
class MockPersonService extends CrudService<Person, Person, Person> {
  getAll(): Observable<Person[]> {
    return of([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' }
    ]);
  }
  getById(id: string): Observable<Person> {
    throw new Error('Method not implemented.');
  }
  add(item: Person): Observable<Person> {
    throw new Error('Method not implemented.');
  }
  update(item: Person): Observable<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Observable<void> {
    return of(void 0);
  }
}

class MockColorService extends CrudService<Color, Color, Color> {
  getAll(): Observable<Color[]> {
    return of([
      { id: '1', color: 'Red' },
      { id: '2', color: 'Blue' },
      { id: '3', color: 'Green' }
    ]);
  }
  getById(id: string): Observable<Color> {
    throw new Error('Method not implemented.');
  }
  add(item: Color): Observable<Color> {
    throw new Error('Method not implemented.');
  }
  update(item: Color): Observable<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Observable<void> {
    return of(void 0);
  }
}

class MockProductService extends CrudService<Product, Product, Product> {
  getAll(): Observable<Product[]> {
    return of([
      { id: '1', name: 'Laptop', price: 999.99 },
      { id: '2', name: 'Mouse', price: 29.99 },
      { id: '3', name: 'Keyboard', price: 79.99 }
    ]);
  }
  getById(id: string): Observable<Product> {
    throw new Error('Method not implemented.');
  }
  add(item: Product): Observable<Product> {
    throw new Error('Method not implemented.');
  }
  update(item: Product): Observable<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Observable<void> {
    return of(void 0);
  }
}

@Component({
  selector: 'app-base-list-test',
  standalone: true,
  imports: [BaseListComponent, CommonModule],
  template: `
    <div class="test-container">
      <h1>BaseListComponent Test</h1>
      
      <section class="test-section">
        <h2>Test 1: Person List</h2>
        <app-generic-list
          [service]="personService"
          [itemTemplate]="personTemplate"
          title="People"
          entityIcon="pi-users">
        </app-generic-list>
        
        <ng-template #personTemplate let-item>
          <div class="person-item">
            <strong>{{ item.name }}</strong> (ID: {{ item.id }})
          </div>
        </ng-template>
      </section>

      <section class="test-section">
        <h2>Test 2: Color List</h2>
        <app-generic-list
          [service]="colorService"
          [itemTemplate]="colorTemplate"
          title="Colors"
          entityIcon="pi-palette">
        </app-generic-list>
        
        <ng-template #colorTemplate let-item>
          <div class="color-item">
            <span class="color-swatch" [style.background-color]="item.color"></span>
            <span>{{ item.color }}</span>
          </div>
        </ng-template>
      </section>

      <section class="test-section">
        <h2>Test 3: Product List</h2>
        <app-generic-list
          [service]="productService"
          [itemTemplate]="productTemplate"
          title="Products"
          entityIcon="pi-shopping-cart">
        </app-generic-list>
        
        <ng-template #productTemplate let-item>
          <div class="product-item">
            <span class="product-name">{{ item.name }}</span>
            <span class="product-price">\${{ item.price | number:'1.2-2' }}</span>
          </div>
        </ng-template>
      </section>
    </div>
  `,
  styles: `
    .test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .test-section {
      margin-bottom: 50px;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .test-section h2 {
      margin-top: 0;
      color: #555;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }

    .person-item {
      padding: 10px;
      background: white;
      border-radius: 4px;
    }

    .color-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }

    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    .product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }

    .product-name {
      font-weight: 500;
    }

    .product-price {
      color: #28a745;
      font-weight: bold;
    }
  `
})
export class BaseListTestComponent {
  personService: CrudService<Person, Person, Person>;
  colorService: CrudService<Color, Color, Color>;
  productService: CrudService<Product, Product, Product>;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.personService = new MockPersonService();
    this.colorService = new MockColorService();
    this.productService = new MockProductService();
  }
}
