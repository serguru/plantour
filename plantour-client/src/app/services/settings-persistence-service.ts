import { Injectable } from '@angular/core';

export abstract class SettingsPersistenceService {
  abstract setComponentKey(componentId: string, key: string, value: any);
  abstract getComponentKey(componentId: string, key: string);
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends SettingsPersistenceService {

  setComponentKey(componentId: string, key: string, value: any) {
    const fullKey = `${componentId}-${key}`;
    if (value === null || value === undefined) {
      localStorage.removeItem(fullKey);
      return;
    }
    localStorage.setItem(fullKey, JSON.stringify(value));
  }
  
  getComponentKey(componentId: string, key: string) {
    const fullKey = `${componentId}-${key}`;
    const value = localStorage.getItem(fullKey);

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

}
