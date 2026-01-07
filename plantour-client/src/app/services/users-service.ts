import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AccessToken, SignUpParticipantRequest, SignUpRequest } from '../models/auth.models';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { AppService } from './app-service';


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

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }

  getUserFromLocalStorage(): AccessToken | null {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return null;
    }
    return jwtDecode<AccessToken>(token);
  }

  currentUser(): AccessToken | null {
    return this.currentUserSubject.getValue();
  }

  writeTokenToStorage(token: string | null): void {
    if (!token) {
      localStorage.removeItem("accessToken");
      return;
    }
    localStorage.setItem("accessToken", token);
  }

  getCurrentUserText(): string {
    const user = this.currentUser();
    if (!user) {
      return "Profile";
    }

    let result = "";
    if (user.last_name && user.first_name) {
      result += `${user.first_name} ${user.last_name}`;
    } else {
      result += user.email
    }

    if (user.role === 'Participant') {
      result += ", participant";
    }

    return result;
  }

  currentUserSubject: BehaviorSubject<AccessToken | null> = new BehaviorSubject<AccessToken | null>(this.getUserFromLocalStorage());
  currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  isAdmin$ = this.currentUser$.pipe(
    tap(user => {
      return user?.role === 'Admin' && this.isAuthenticated;
    })
  ) 


  updateCurrentUser(token: string | null): void {
    let user: any = null;
    if (token) {
      user = jwtDecode<AccessToken>(token);
    }
    this.writeTokenToStorage(token);
    this.currentUserSubject.next(user);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/profile/me`);
  }

  get isAuthenticated(): boolean {
    const user = this.currentUser();
    if (!user || user.exp <= Math.floor(Date.now() / 1000)) {
      // this.resetState();
      // this.appService.resetState();
      return false;
    }
    return true;
  }

  loginAdmin(email: string, password: string): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/admin/signin`, { email, password })
      .pipe(
        tap((r: any) => {
          this.updateCurrentUser(r.accessToken);
        }
        ))
  }


  loginParticipant(accessCode: string): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/participant/signin`, { accessCode })
      .pipe(
        tap((r: any) => {
          this.updateCurrentUser(r.accessToken);
        }
        ))
  }

  registerAdmin(data: SignUpRequest): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/admin/signup`, data)
      .pipe(
        tap((r: any) => {
          this.updateCurrentUser(r.accessToken);
        })
      )
  }

  registerParticipant(data: SignUpParticipantRequest): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/participant/signup`, data)
  }

  get isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'Admin' && this.isAuthenticated;
  }

  get isParticipant(): boolean {
    const user = this.currentUser();
    return user?.role === 'Participant' && this.isAuthenticated;
  }


  signOut(): void {
    this.resetState();
    this.appService.resetState();
    localStorage.removeItem("accessToken");
  }

  resetState(): void {
    this.updateCurrentUser(null);
  }

}