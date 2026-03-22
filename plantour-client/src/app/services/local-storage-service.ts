import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private document = inject(DOCUMENT);

  private get storage(): Storage | null {
    return this.document?.defaultView?.localStorage ?? null;
  }

  isOA(value: any | null): boolean {
    return Array.isArray(value) || typeof value === 'object';
  }

  setItem(key: string, value: any): void {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot persist value: no key`);
    }
    if (!this.storage) {
      return;
    }
    if (value === null || value === undefined) {
      this.storage.removeItem(key);
      return;
    }
    this.storage.setItem(key, value);
  }

  setItemObject(key: string, value: any): void {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot persist object value: no key`);
    }

    if (!this.storage) {
      return;
    }

    if (!this.isOA(value)) {
      throw new Error(`Input value is not an object or array: ${value}`);
    }

    const stringValue = JSON.stringify(value);
    this.storage.setItem(key, stringValue);

  }

  removeItem(key: string): void {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot remove value: no key`);
    }
    if (!this.storage) {
      return;
    }
    this.storage.removeItem(key);
  }

  clear(): void {
    if (!this.storage) {
      return;
    }
    this.storage.clear();
  }
 

  setComponentKey(componentId: string, key: string, value: any | null) {
    if (!componentId || componentId.trim().length === 0) {
      throw new Error(`Cannot persist value: no componentId specified for ${key} and value ${value}`);
    }
    const fullKey = `${componentId}-${key}`;

    if (this.isOA(value)) {
      this.setItemObject(fullKey, value);
      return;
    }

    this.setItem(fullKey, value);
  }

  getItem(key: string): any | null {
    if (!this.storage) {
      return null;
    }
    const value = this.storage.getItem(key);
    if (!value) {
      return null;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return value;
  }

  getItemObject(key: string): any | null {
    const value = this.getItem(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  getComponentKey(componentId: string, key: string): any | null {
    const fullKey = `${componentId}-${key}`;
    return this.getItem(fullKey);
  }

  getComponentBooleanKey(componentId: string, key: string, defaultValue: boolean): boolean {
    const value = this.getComponentKey(componentId, key);
    return typeof value === 'boolean' ? value : defaultValue;
  }

  getComponentKeyObject(componentId: string, key: string): any | null {
    const fullKey = `${componentId}-${key}`;
    return this.getItemObject(fullKey);
  }

}
