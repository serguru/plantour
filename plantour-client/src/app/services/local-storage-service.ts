import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  setKey(key: string, value: any) {
    if (!key || key.trim().length === 0) {
      throw new Error(`Cannot persist value: no key`);
    }
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  setComponentKey(componentId: string, key: string, value: any) {
    if (!componentId || componentId.trim().length === 0) {
      throw new Error(`Cannot persist value: no componentId specified for ${key} and value ${value}`);
    }
    const fullKey = `${componentId}-${key}`;
    this.setKey(fullKey, value);
  }
  
  getKey(key: string) {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    let result: any | null = null;
    try {
      result = JSON.parse(value!);
    } catch (error) {
      result = null;
    }    

    return result;
  }

  getComponentKey(componentId: string, key: string) {
    const fullKey = `${componentId}-${key}`;
    return this.getKey(fullKey);
  }

}
