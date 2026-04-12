import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ENVIRONMENT } from '../../environment.token';
import { AccessTokenPayload, ApiErrorResponse, AuthResponse, CurrentUser, SignInRequest } from '../models/auth.models';
import { UserDto } from '../models/user.models';
import { LocalStorageService } from './local-storage-service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly environment = inject(ENVIRONMENT);

  private readonly accessTokenKey = 'accessToken';
  private readonly legacySessionStorageKey = 'plantour-maintenance.session';
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly accessTokenPayloadSignal = signal<AccessTokenPayload | null>(null);

  readonly currentUser = computed(() => this.toCurrentUser(this.accessTokenPayloadSignal()));
  readonly accessToken = computed(() => this.accessTokenSignal());
  readonly isAuthenticated = computed(() => this.accessToken() !== null);
  readonly displayName = computed(() => this.currentUser()?.name ?? null);

  constructor() {
    const accessToken = this.getAccessTokenFromLocalStorage() ?? this.migrateLegacySession();
    this.updateAuthState(accessToken);
  }

  signIn(request: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.buildUrl('/auth/sign-in'), request).pipe(
      tap((response) => this.applyAuthResponse(response))
    );
  }

  signOut(redirectToSignIn = false): void {
    this.clearAuthState();

    if (redirectToSignIn) {
      void this.router.navigate(['/sign-in']);
    }
  }

  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(this.buildUrl('/users/me'));
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.buildUrl('/users'));
  }

  handleUnauthorized(): void {
    this.clearAuthState();
    void this.router.navigate(['/sign-in']);
  }

  private applyAuthResponse(response: AuthResponse): void {
    this.writeAccessToken(response.accessToken);
    this.updateAuthState(response.accessToken);
  }

  private updateAuthState(accessToken: string | null): void {
    if (!accessToken) {
      this.accessTokenSignal.set(null);
      this.accessTokenPayloadSignal.set(null);
      return;
    }

    const payload = this.decodeAccessToken(accessToken);
    const currentUser = payload ? this.toCurrentUser(payload) : null;

    if (!payload || !currentUser || this.isExpired(payload.exp)) {
      this.clearAuthState();
      return;
    }

    this.accessTokenSignal.set(accessToken);
    this.accessTokenPayloadSignal.set(payload);
  }

  private clearAuthState(): void {
    this.accessTokenSignal.set(null);
    this.accessTokenPayloadSignal.set(null);
    this.writeAccessToken(null);
    this.localStorageService.removeItem(this.legacySessionStorageKey);
  }

  private getAccessTokenFromLocalStorage(): string | null {
    return this.localStorageService.getItem(this.accessTokenKey);
  }

  private writeAccessToken(accessToken: string | null): void {
    this.localStorageService.setItem(this.accessTokenKey, accessToken);
  }

  private migrateLegacySession(): string | null {
    const legacySession = this.localStorageService.getItemObject<{ accessToken?: string }>(this.legacySessionStorageKey);
    this.localStorageService.removeItem(this.legacySessionStorageKey);

    if (!legacySession?.accessToken) {
      return null;
    }

    this.writeAccessToken(legacySession.accessToken);
    return legacySession.accessToken;
  }

  private decodeAccessToken(accessToken: string): AccessTokenPayload | null {
    try {
      return jwtDecode<AccessTokenPayload>(accessToken);
    } catch {
      return null;
    }
  }

  private toCurrentUser(payload: AccessTokenPayload | null): CurrentUser | null {
    if (!payload) {
      return null;
    }

    const id = payload.nameid
      ?? payload.sub
      ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const email = payload.email
      ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const name = payload.unique_name
      ?? payload.name
      ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    if (!id || !email || !name) {
      return null;
    }

    return {
      id,
      email,
      name
    };
  }

  private isExpired(expirationUnixSeconds: number): boolean {
    return !Number.isFinite(expirationUnixSeconds) || expirationUnixSeconds <= Math.floor(Date.now() / 1000);
  }

  private buildUrl(path: string): string {
    return `${this.environment.api.baseUrl}${path}`;
  }

  getErrorMessage(error: unknown): string {
    const apiError = error as { error?: ApiErrorResponse };
    return apiError.error?.message ?? 'The request failed. Please try again.';
  }
}
