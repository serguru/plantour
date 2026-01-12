import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  isOA(value: any | null): boolean {
    return Array.isArray(value) || typeof value === 'object';
  }

  setItem(key: string, value: any): void {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot persist value: no key`);
    }
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, value);
  }

  setItemObject(key: string, value: any): void {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot persist object value: no key`);
    }

    if (!this.isOA(value)) {
      throw new Error(`Input value is not an object or array: ${value}`);
    }

    const stringValue = JSON.stringify(value);
    localStorage.setItem(key, stringValue);

  }

  removeItem(key: string): void {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot remove value: no key`);
    }
    localStorage.removeItem(key);
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
    const value = localStorage.getItem(key);
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

  getComponentKeyObject(componentId: string, key: string): any | null {
    const fullKey = `${componentId}-${key}`;
    return this.getItemObject(fullKey);
  }

}
