import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ENVIRONMENT } from '../../environment.token';
import { ApiErrorResponse, AuthResponse, SignInRequest, StoredSession } from '../models/auth.models';
import { UserDto } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly environment = inject(ENVIRONMENT);

  private readonly sessionStorageKey = 'plantour-maintenance.session';
  private readonly hasRestoredSession = signal(false);
  private readonly sessionSignal = signal<StoredSession | null>(this.readStoredSession());

  readonly currentUser = computed(() => this.sessionSignal()?.user ?? null);
  readonly accessToken = computed(() => {
    const session = this.sessionSignal();
    if (!session || this.isExpired(session.expiresAtUtc)) {
      return null;
    }

    return session.accessToken;
  });
  readonly isAuthenticated = computed(() => this.accessToken() !== null);
  readonly displayName = computed(() => this.currentUser()?.name ?? null);

  signIn(request: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.buildUrl('/auth/sign-in'), request).pipe(
      tap((response) => this.setSession(response))
    );
  }

  signOut(redirectToSignIn = false): void {
    this.clearSession();

    if (redirectToSignIn) {
      void this.router.navigate(['/sign-in']);
    }
  }

  restoreSession(): void {
    if (this.hasRestoredSession()) {
      return;
    }

    this.hasRestoredSession.set(true);

    const session = this.sessionSignal();
    if (!session) {
      return;
    }

    if (this.isExpired(session.expiresAtUtc)) {
      this.clearSession();
      return;
    }

    this.getCurrentUser().pipe(
      tap((user) => {
        this.sessionSignal.update((currentSession) => currentSession ? {
          ...currentSession,
          user
        } : currentSession);
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    ).subscribe({
      error: () => {
      }
    });
  }

  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(this.buildUrl('/users/me'));
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.buildUrl('/users'));
  }

  handleUnauthorized(): void {
    this.clearSession();
    void this.router.navigate(['/sign-in']);
  }

  private setSession(response: AuthResponse): void {
    const session: StoredSession = {
      accessToken: response.accessToken,
      expiresAtUtc: response.expiresAtUtc,
      user: response.user
    };

    this.sessionSignal.set(session);
    this.writeStoredSession(session);
  }

  private clearSession(): void {
    this.sessionSignal.set(null);
    this.removeStoredSession();
  }

  private readStoredSession(): StoredSession | null {
    const storage = this.getStorage();
    const rawValue = storage?.getItem(this.sessionStorageKey);
    if (!rawValue) {
      return null;
    }

    try {
      const session = JSON.parse(rawValue) as StoredSession;
      if (!session.accessToken || !session.expiresAtUtc || !session.user) {
        this.removeStoredSession();
        return null;
      }

      if (this.isExpired(session.expiresAtUtc)) {
        this.removeStoredSession();
        return null;
      }

      return session;
    } catch {
      this.removeStoredSession();
      return null;
    }
  }

  private writeStoredSession(session: StoredSession): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    storage.setItem(this.sessionStorageKey, JSON.stringify(session));
  }

  private removeStoredSession(): void {
    this.getStorage()?.removeItem(this.sessionStorageKey);
  }

  private isExpired(expiresAtUtc: string): boolean {
    const expirationTime = new Date(expiresAtUtc).getTime();
    return Number.isNaN(expirationTime) || expirationTime <= Date.now();
  }

  private getStorage(): Storage | null {
    if (!('localStorage' in globalThis)) {
      return null;
    }

    return globalThis.localStorage;
  }

  private buildUrl(path: string): string {
    return `${this.environment.api.baseUrl}${path}`;
  }

  getErrorMessage(error: unknown): string {
    const apiError = error as { error?: ApiErrorResponse };
    return apiError.error?.message ?? 'The request failed. Please try again.';
  }
}
