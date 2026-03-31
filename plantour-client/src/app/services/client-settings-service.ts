import { HttpBackend, HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

interface ClientSettingsResponse {
  globalSpinnerTimeoutSec?: number | null;
}

const DEFAULT_GLOBAL_SPINNER_TIMEOUT_SEC = 30;

@Injectable({
  providedIn: 'root',
})
export class ClientSettingsService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly settingsSignal = signal({
    globalSpinnerTimeoutSec: DEFAULT_GLOBAL_SPINNER_TIMEOUT_SEC,
  });
  private loadPromise: Promise<void> | null = null;

  readonly globalSpinnerTimeoutSec = computed(() => this.settingsSignal().globalSpinnerTimeoutSec);

  constructor(@Inject(ENVIRONMENT) private readonly environment: EnvironmentConfig) {}

  load(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = firstValueFrom(
      this.http.get<ClientSettingsResponse>(`${this.environment.api.baseUrl}/users/client-settings`)
    )
      .then(response => {
        const timeout = Number(response?.globalSpinnerTimeoutSec);
        if (Number.isFinite(timeout) && timeout > 0) {
          this.settingsSignal.set({
            globalSpinnerTimeoutSec: Math.trunc(timeout),
          });
        }
      })
      .catch(() => undefined);

    return this.loadPromise;
  }
}