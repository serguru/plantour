import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly document = inject(DOCUMENT);

  private get storage(): Storage | null {
    return this.document?.defaultView?.localStorage ?? null;
  }

  getItem(key: string): string | null {
    if (!this.storage) {
      return null;
    }

    return this.storage.getItem(key);
  }

  getItemObject<T>(key: string): T | null {
    const value = this.getItem(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string | null): void {
    if (!this.storage) {
      return;
    }

    if (value === null) {
      this.storage.removeItem(key);
      return;
    }

    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.storage?.removeItem(key);
  }
}