import { Injectable, Inject, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AccessToken, SignUpParticipantRequest, SignUpRequest } from '../models/auth.models';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { AppService } from './app-service';
import { LocalStorageService } from './local-storage-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessagesService } from './messages-service';

export interface TemporaryUserResponse {
  accessToken: string;
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

  // Основной источник правды — Writable Signal
  private _userSignal = signal<AccessToken | null>(this.getUserFromLocalStorage());

  // Публичные сигналы теперь 100% синхронные через computed
  userSignal = this._userSignal.asReadonly();

  userTextSignal = computed(() => {
    const user = this._userSignal();
    if (!user) return "Profile";

    if (user.last_name && user.first_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  });

  isAuthenticatedSignal = computed(() => {
    const user = this._userSignal();
    const now = Math.floor(Date.now() / 1000);

    if (!user || user.exp <= now || ['Admin', 'Participant'].indexOf(user.role) === -1) {
      return false;
    }
    return true;
  });

  isAdminSignal = computed(() => {
    const user = this._userSignal();
    return user?.role === 'Admin' && this.isAuthenticatedSignal();
  });

  isParticipantSignal = computed(() => {
    const user = this._userSignal();
    return user?.role === 'Participant' && this.isAuthenticatedSignal();
  });

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }

  private getUserFromLocalStorage(): AccessToken | null {
    const token = this.localStorageService.getItem("accessToken");
    if (!token) return null;
    try {
      return jwtDecode<AccessToken>(token);
    } catch {
      return null;
    }
  }

  private writeTokenToStorage(token: string | null): void {
    this.localStorageService.setItem("accessToken", token);
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
    this.writeTokenToStorage(token);
    this._userSignal.set(user);
  }

  loginAdmin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/admin/signin`, { email, password })
      .pipe(
        tap((r: any) => {
          this.updateUser(r.accessToken);
        })
      );
  }

  loginParticipant(accessCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/participant/signin`, { accessCode })
      .pipe(
        tap((r: any) => {
          this.updateUser(r.accessToken);
        })
      );
  }

  registerAdmin(data: SignUpRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/admin/signup`, data)
      .pipe(
        tap((r: any) => {
          this.updateUser(r.accessToken);
        })
      );
  }

  registerParticipant(data: SignUpParticipantRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/participant/signup`, data);
  }

  registerTemporaryAdmin(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/create-temporary-user`, {});
  }

  signOut(): void {
    this.updateUser(null);
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


}