import { Injectable, Inject, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AccessRule, AccessToken, AuthResponse, SignInResponse, SignUpParticipantRequest } from '../models/auth.models';
import { ContactSubmissionRequest, ContactSubmissionDto } from '../models/contact.models';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { AppService } from './app-service';
import { LocalStorageService } from './local-storage-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessagesService } from './messages-service';
import { getFullName } from '../helpers/utils';

export interface TemporaryUserResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  email: string;
  firstName: string;
  lastName: string;
  currentTripId: string;
  temporaryUserAccessTokenExpirationDays: number;
  itemsLimit: number;
  participantsLimit: number;
}

export interface UserDto {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: number | null;
  notes?: string | null;
  hasGoogleLinked: boolean;
  hasFacebookLinked: boolean;

}

export interface TokenRequestDto {
  accessToken: string;
  refreshToken: string;
};

export interface ScheduledPlanDowngradeInfoDto {
  hasScheduledDowngrade: boolean;
  jobId?: string | null;
  createdAt?: string | null;
  executionTime?: string | null;
  oldPlanPrice?: string | null;
  newPlanPrice?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl: string;
  appService = inject(AppService);
  localStorageService = inject(LocalStorageService);


  //currentTripService = inject(CurrentTripService);

  router = inject(Router);
  messagesService = inject(MessagesService);

  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';

  private _userSignal = signal<AccessToken | null>(this.getUserFromLocalStorage());

  userSignal = this._userSignal.asReadonly();

  tokenExpiredAtSignal = computed(() => {
    const user = this._userSignal();
    if (!user) return null;
    const d = new Date(user.exp * 1000);
    return d.toLocaleString();
  });


  userEmail = computed(() => {
    const user = this._userSignal();
    if (!user) return null;
    return user.email ?? null;
  });

  userBillingPeriodStartSignal = computed<Date | null>(() => {
    const user = this._userSignal();
    if (!user) return null;
    const result = user['billing_period_start'];

    if (!result) {
      return null;
    }

    return new Date(result);
  });

  userBillingPeriodEndSignal = computed<Date | null>(() => {
    const user = this._userSignal();
    if (!user) return null;
    const result = user['billing_period_end'];
    if (!result) {
      return null;
    }
    return new Date(result);
  });

  isTemporarySignal = computed<boolean>(() => {
    const user = this._userSignal();
    if (!user) return false;
    const result = user['temporary'];
    if (!result) {
      return false;
    }
    return result === 'true';
  });



  userRoleSignal = computed(() => {
    const user = this._userSignal();
    if (!user) return null;
    return this.getRole() ?? null;
  });

  userTextSignal = computed(() => {
    const user = this._userSignal();
    if (!user) {
      return "Profile";
    }

    const result = getFullName(user.first_name ?? '', user.last_name ?? '', user.email ?? '', false);
    return result;

  });

  isAuthenticatedSignal = computed(() => {
    const now = Math.floor(Date.now() / 1000);
    const role = this.getRole();
    const user = this._userSignal();
    //    if (!user || !user.exp || user.exp <= now || ['Admin', 'Participant'].indexOf(role ?? '') === -1) {
    if (!user || ['Admin', 'Participant'].indexOf(role ?? '') === -1) {
      return false;
    }
    return true;
  });

  isAdminSignal = computed(() => {
    const role = this.getRole();
    return role === 'Admin' && this.isAuthenticatedSignal();
  });

  isParticipantSignal = computed(() => {
    const role = this.getRole();
    return role === 'Participant' && this.isAuthenticatedSignal();
  });

  planPeriodSignal = computed(() => {
    const user = this._userSignal();
    if (!user) return null;
    const result = user['plan_period'];
    return result ?? null;
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

      const decoded = jwtDecode<AccessToken>(token);
      decoded.access_rules = JSON.parse(decoded.access_rules as unknown as string) as AccessRule[] || [];

      return decoded;
    } catch {
      return null;
    }
  }

  private getRefreshTokenFromLocalStorage(): string | null {
    const result = this.localStorageService.getItem(this.refreshTokenKey);
    if (!result) {
      return null;
    }
    return result;
  }

  private getAccessTokenFromLocalStorage(): string | null {
    const result = this.localStorageService.getItem(this.accessTokenKey);
    if (!result) {
      return null;
    }
    return result;
  }


  get accessToken(): string | null {
    return this.getAccessTokenFromLocalStorage();
  }

  get refreshToken(): string | null {
    return this.getRefreshTokenFromLocalStorage();
  }

  public writeAccessToken(token: string | null): void {
    this.localStorageService.setItem(this.accessTokenKey, token);
  }

  public writeRefreshToken(token: string | null): void {
    this.localStorageService.setItem(this.refreshTokenKey, token);
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
    this._userSignal.set(user);
  }

  public applyAuthResponse(response: any): void {
    this.updateUser(response.accessToken || null);
    this.writeAccessToken(response.accessToken || null);
    this.writeRefreshToken(response.refreshToken || null);
  }

  sendLoginEmailAdmin(email: string): Observable<SignInResponse> {
    return this.http.post<SignInResponse>(`${this.apiUrl}/api/users/admin/send-signin-email`, { email });
  }

  loginAdminByToken(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/admin/signin-token`, { token })
      .pipe(
        tap((r: AuthResponse) => {
          this.applyAuthResponse(r);
        })
      );
  }

  //signin-token

  loginParticipant(accessCode: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/participant/signin`, { accessCode })
      .pipe(
        tap((r: AuthResponse) => {
          this.applyAuthResponse(r);
        })
      );
  }

  socialSignIn(provider: 'google' | 'facebook', token: string): Observable<AuthResponse> {
    const payload = provider === 'google'
      ? { provider, googleIdToken: token }
      : { provider, facebookAccessToken: token };

    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/admin/social/signin`, payload)
      .pipe(
        tap((r: AuthResponse) => {
          this.applyAuthResponse(r);
        })
      );
  }

  linkSocialProvider(provider: 'google' | 'facebook', token: string): Observable<UserDto> {
    const payload = provider === 'google'
      ? { provider, googleIdToken: token }
      : { provider, facebookAccessToken: token };

    return this.http.post<UserDto>(`${this.apiUrl}/api/users/profile/social/link`, payload);
  }

  unlinkSocialProvider(provider: 'google' | 'facebook'): Observable<UserDto> {
    return this.http.delete<UserDto>(`${this.apiUrl}/api/users/profile/social/${provider}`);
  }

  registerParticipant(data: SignUpParticipantRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/users/participant/signup`, data);
  }

  registerTemporaryAdmin(): Observable<TemporaryUserResponse> {
    return this.http.post<TemporaryUserResponse>(`${this.apiUrl}/api/users/create-temporary-user`, {})
      .pipe(
        tap((r: TemporaryUserResponse) => {

          this.localStorageService.clear();
          this.updateUser(r.accessToken || null);
          this.writeAccessToken(r.accessToken || null);
          this.writeRefreshToken(null);
          this.localStorageService.setComponentKey('trips', 'selectedId', r.currentTripId);
          this.localStorageService.setItem('toolbar-showTripText', true);
          //          this.currentTripService.updateCurrentTripVisible(true);
        }));
  }

  signOut(): void {
    this.updateUser(null);
    this.writeAccessToken(null);
    this.writeRefreshToken(null);
  }

  resendSignIn(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/users/admin/resend-confirmation`, { email });
  }

  confirmEmail(userId: string, token: string): Observable<{ confirmed: boolean }> {
    return this.http.post<{ confirmed: boolean }>(`${this.apiUrl}/api/users/admin/confirm-email`, { userId, token });
  }

  submitContact(request: ContactSubmissionRequest): Observable<ContactSubmissionDto> {
    return this.http.post<ContactSubmissionDto>(`${this.apiUrl}/api/users/contact/submit`, request);
  }

  currentUserOk$ = (type?: 'admin' | 'participant'): Observable<boolean> => {
    const result = this.isAuthenticatedSignal();
    if (!result) {
      this.router.navigate(['sign-in']);
    }
    return of(result);
  }

  getCurrentUserId(): string | null {
    const us = this._userSignal();
    return us?.user_id ?? null;
  }

  public getRole(): string | null {
    const token = this._userSignal();
    return token?.role ?? null;
  }

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/api/users/profile`);
  }

  updateProfile(request: { email?: string; firstName?: string; lastName?: string; phone?: string }): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/api/users/profile`, request);
  }

  downgradePlanPrice(oldPlanPrice: string, newPlanPrice: string): Observable<{ updated: boolean }> {
    return this.http.put<{ updated: boolean }>(`${this.apiUrl}/api/users/downgrade-plan-price/schedule`, {
      oldPlanPrice,
      newPlanPrice
    });
  }

  getScheduledDowngrade(): Observable<ScheduledPlanDowngradeInfoDto> {
    return this.http.get<ScheduledPlanDowngradeInfoDto>(`${this.apiUrl}/api/users/downgrade-plan-price/scheduled`);
  }

  cancelScheduledDowngrade(): Observable<{ cancelled: boolean }> {
    return this.http.delete<{ cancelled: boolean }>(`${this.apiUrl}/api/users/downgrade-plan-price/scheduled`);
  }

  upgradePlanPrice(oldPlanPrice: string, newPlanPrice: string): Observable<{ updated: boolean }> {
    return this.http.put<{ updated: boolean }>(`${this.apiUrl}/api/users/upgrade-plan-price`, {
      oldPlanPrice,
      newPlanPrice
    });
  }

  refreshTokens(): Observable<AuthResponse> {
    const payload = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/users/refresh-token`, payload).pipe(
      tap(res => {
        this.applyAuthResponse(res);
      })
    );
  }

  isJwtExpired = (jwt: string): boolean => {
    try {
      const decoded: any = jwtDecode(jwt);
      const exp: number | undefined = decoded?.exp;
      if (!exp) {
        return true;
      }
      const now = Math.floor(Date.now() / 1000);
      return exp <= now;
    } catch {
      return true;
    }
  };

  createTemporaryUser = async () => {

    const dialogResult = await this.messagesService.openOkCancel({
      title: `Start Guest Access Mode`,
      message: "You are entering Guest Mode! You can explore Plantour without creating an account. Ready to start?",
      okLabel: 'Yes',
      cancelLabel: 'No'
    });

    if (dialogResult !== 'ok') {
      return;
    }

    this.registerTemporaryAdmin().subscribe({

      next: (response: TemporaryUserResponse) => {
        const path = `/trips/${response.currentTripId}/trip-things`;
        this.router.navigate([path]);

        this.messagesService.openInfo({
          title: `Welcome to Plantour!`,
          message: `You are now in Guest Access Mode as Robin Miles for ${response.temporaryUserAccessTokenExpirationDays} days. The app works with full features, except you are limited to ${response.itemsLimit} items and ${response.participantsLimit} participants. To get started, add items to your current trip "Weekend in Las Vegas", pack them into bags, and download a packing list. 
          
          If you need help, see Guest Mode Help. Good luck!
          `
        });
      }
    });
  }

  isUserTemporary(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.environment.apiUrl}/api/users/is-user-temporary`, {
      params: { email }
    });
  }

  convertTemporaryUser(oldEmail: string, newEmail: string): Observable<void> {
    return this.http.put<void>(`${this.environment.apiUrl}/api/users/convert-temporary-user`, {
      oldEmail,
      newEmail
    })
  }
}