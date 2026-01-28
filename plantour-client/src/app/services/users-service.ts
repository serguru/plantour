import { Injectable, Inject, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AccessToken, AuthResponse, SignUpParticipantRequest, SignUpRequest } from '../models/auth.models';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { AppService } from './app-service';
import { LocalStorageService } from './local-storage-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessagesService } from './messages-service';

export interface TemporaryUserResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  email: string;
  firstName: string;
  lastName: string;
  currentTripId: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: number | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl: string;
  appService = inject(AppService);
  localStorageService = inject(LocalStorageService);
  router = inject(Router);
  messagesService = inject(MessagesService);
  private refreshInFlight?: Observable<AuthResponse>;

  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';

  private readonly claimEmail = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
  private readonly claimGivenName = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname';
  private readonly claimSurname = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname';
  private readonly claimRole = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  private readonly claimNameIdentifier = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
  private readonly claimAdminId = 'admin_id';

  // Основной источник правды — Writable Signal
  private _userSignal = signal<AccessToken | null>(this.getUserFromLocalStorage());

  // Публичные сигналы теперь 100% синхронные через computed
  userSignal = this._userSignal.asReadonly();

  userTextSignal = computed(() => {
    const user = this._userSignal();
    if (!user) return "Profile";

    const firstName = this.getClaim(user, [this.claimGivenName, 'first_name']);
    const lastName = this.getClaim(user, [this.claimSurname, 'last_name']);
    const email = this.getClaim(user, [this.claimEmail, 'email']);

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return email ?? 'Profile';
  });

  isAuthenticatedSignal = computed(() => {
    const user = this._userSignal();
    const now = Math.floor(Date.now() / 1000);
    const role = this.getRole(user);

    if (!user || !user.exp || user.exp <= now || ['Admin', 'Participant'].indexOf(role ?? '') === -1) {
      return false;
    }
    return true;
  });

  isAdminSignal = computed(() => {
    const role = this.getRole(this._userSignal());
    return role === 'Admin' && this.isAuthenticatedSignal();
  });

  isParticipantSignal = computed(() => {
    const role = this.getRole(this._userSignal());
    return role === 'Participant' && this.isAuthenticatedSignal();
  });

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }

  private getUserFromLocalStorage(): AccessToken | null {
    const token = this.localStorageService.getItem(this.accessTokenKey);
    if (!token) return null;
    try {
      return jwtDecode<AccessToken>(token);
    } catch {
      return null;
    }
  }

  private writeAccessToken(token: string | null): void {
    this.localStorageService.setItem(this.accessTokenKey, token);
  }

  private writeRefreshToken(token: string | null): void {
    this.localStorageService.setItem(this.refreshTokenKey, token);
  }

  getAccessToken(): string | null {
    return this.localStorageService.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return this.localStorageService.getItem(this.refreshTokenKey);
  }

  updateUser(token: string | null): void {
    let user: AccessToken | null = null;
    if (token) {
      try {
        user = jwtDecode<AccessToken>(token);
      } catch (e) {
        console.error("Token decoding failed", e);
      }
    }
    this.writeAccessToken(token);
    this._userSignal.set(user);
  }

  private applyAuthResponse(response: AuthResponse): void {
    this.writeAccessToken(response.accessToken || null);
    this.writeRefreshToken(response.refreshToken || null);
    this.updateUser(response.accessToken || null);
  }

  loginAdmin(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/admin/signin`, { email, password })
      .pipe(
        tap((r: AuthResponse) => {
          this.applyAuthResponse(r);
        })
      );
  }

  loginParticipant(accessCode: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/participant/signin`, { accessCode })
      .pipe(
        tap((r: AuthResponse) => {
          this.applyAuthResponse(r);
        })
      );
  }

  registerAdmin(data: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/admin/signup`, data);
  }

  registerParticipant(data: SignUpParticipantRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/participant/signup`, data);
  }

  registerTemporaryAdmin(): Observable<TemporaryUserResponse> {
    return this.http.post<TemporaryUserResponse>(`${this.apiUrl}/api/users/create-temporary-user`, {})
      .pipe(
        tap((r: TemporaryUserResponse) => {
          this.writeAccessToken(r.accessToken || null);
          this.writeRefreshToken(r.refreshToken || null);
          this.updateUser(r.accessToken || null);
        })
      );
  }

  signOut(): void {
    const refreshToken = this.getRefreshToken();
    this.updateUser(null);
    this.writeRefreshToken(null);
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/api/users/revoke`, { refreshToken }).subscribe({ error: () => null });
    }
  }

  refreshTokens(): Observable<AuthResponse> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    this.refreshInFlight = this.http.post<AuthResponse>(`${this.apiUrl}/api/users/refresh`, { refreshToken })
      .pipe(
        tap((r: AuthResponse) => this.applyAuthResponse(r)),
        finalize(() => {
          this.refreshInFlight = undefined;
        }),
        shareReplay(1)
      );

    return this.refreshInFlight;
  }

  resendConfirmation(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/users/admin/resend-confirmation`, { email });
  }

  confirmEmail(userId: string, token: string): Observable<{ confirmed: boolean }> {
    return this.http.post<{ confirmed: boolean }>(`${this.apiUrl}/api/users/admin/confirm-email`, { userId, token });
  }

  currentUserOk = (type?: 'admin' | 'participant'): boolean => {
    const user = this._userSignal();
    if (!user) {
      this.messagesService.showWarning('Please sign in to continue or ask your administrator for a new invite.');
      this.router.navigate(['/sign-in']);
      return false;
    }

    if (!this.isAuthenticatedSignal()) {

      this.signOut();
 
      if (type === 'admin' && this.isAdminSignal()) {
        this.messagesService.showWarning('Your session has expired. Please sign in again.');
        this.router.navigate(['/sign-in']);
        return false;
      }

      if (type === 'participant' && this.isParticipantSignal()) {
        this.messagesService.showWarning('Your access has expired. Please contact your administrator for a new invite');
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;

  }

  getCurrentUserId(): string | null {
    return this.getClaim(this._userSignal(), [this.claimNameIdentifier, 'user_id']) ?? null;
  }

  private getClaim(token: AccessToken | null, keys: string[]): string | undefined {
    if (!token) {
      return undefined;
    }

    for (const key of keys) {
      const value = token[key];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    return undefined;
  }

  private getRole(token: AccessToken | null): string | undefined {
    return this.getClaim(token, [this.claimRole, 'role']);
  }


}