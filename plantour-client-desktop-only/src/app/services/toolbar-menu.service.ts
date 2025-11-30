import { Injectable, computed, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToolbarMenuService {
  private layoutItems = signal<MenuItem[]>([]);
  private childItems = signal<MenuItem[]>([]);

  /** Items contributed by LayoutComponent (global layout menu) */
  readonly layoutMenu = computed(() => this.layoutItems());

  /** Items contributed by the currently active child component (feature-level menu) */
  readonly childMenu = computed(() => this.childItems());

  /** Consolidated menu: layout items + active child items */
  readonly allMenu = computed(() => [...this.layoutItems(), ...this.childItems()]);

  setLayoutItems(items: MenuItem[]): void {
    this.layoutItems.set(items ?? []);
  }

  setChildItems(items: MenuItem[]): void {
    this.childItems.set(items ?? []);
  }

  clearChildItems(): void {
    this.childItems.set([]);
  }
}
