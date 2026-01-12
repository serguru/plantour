import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  setItem(key: string, value: any): void {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot persist value: no key`);
    }
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
//    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(key, value);
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
    this.setItem(fullKey, value);
  }
  
  getItem(key: string): any | null {
    const value = localStorage.getItem(key);
    if (!value) {
      return null;
    }
    return value;
  }

  getComponentKey(componentId: string, key: string): any | null {
    const fullKey = `${componentId}-${key}`;
    return this.getItem(fullKey);
  }

}
