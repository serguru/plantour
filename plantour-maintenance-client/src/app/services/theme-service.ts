import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { LocalStorageService } from './local-storage-service';

export type ThemePreference = 'system' | 'light' | 'dark';

const themeStorageKey = 'plantour-maintenance-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly mediaQueryList = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  readonly preference = signal<ThemePreference>(this.readStoredPreference());
  readonly systemTheme = signal<'light' | 'dark'>(this.mediaQueryList?.matches ? 'dark' : 'light');
  readonly activeTheme = computed<'light' | 'dark'>(() => {
    const preference = this.preference();

    return preference === 'system' ? this.systemTheme() : preference;
  });

  constructor() {
    effect(() => {
      this.applyTheme(this.activeTheme());
    });

    if (this.mediaQueryList) {
      const listener = (event: MediaQueryListEvent) => {
        this.systemTheme.set(event.matches ? 'dark' : 'light');
      };

      this.mediaQueryList.addEventListener('change', listener);
      this.destroyRef.onDestroy(() => this.mediaQueryList?.removeEventListener('change', listener));
    }
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);

    if (preference === 'system') {
      this.localStorageService.removeItem(themeStorageKey);
      return;
    }

    this.localStorageService.setItem(themeStorageKey, preference);
  }

  private readStoredPreference(): ThemePreference {
    const storedPreference = this.localStorageService.getItem(themeStorageKey);

    return storedPreference === 'light' || storedPreference === 'dark' ? storedPreference : 'system';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const root = this.document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }
}