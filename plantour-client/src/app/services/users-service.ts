import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AccessToken, SignUpRequest } from '../models/auth.models';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';


@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }

  getWeather(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/weatherforecast`);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/profile/me`);
  }

  isTokenExpired(token: string): boolean {
    if (!token) {
      return true;
    }
    const { exp } = jwtDecode<{ exp: number }>(token);
    // UTC time exp is in seconds → convert Date.now() to seconds
    const now = Math.floor(Date.now() / 1000);
    const result = exp < now;
    return result;
  }

  get isAuthenticated(): boolean {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  loginAdmin(email: string, password: string): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/auth/admin/signin`, { email, password })
      .pipe(
        tap((r: any) => {
          let a = jwtDecode(r.accessToken);
          localStorage.setItem("accessToken", r.accessToken);
        }
        ))
  }

  writeTokensToStorage(accessToken: string, refreshToken: string): void {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  loginParticipant(accessCode: string): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/auth/participant/signin`, { accessCode })
      .pipe(
        tap((r: any) => {
          this.writeTokensToStorage(r.accessToken, r.refreshToken);
        }
        ))
  }

  registerAdmin(data: SignUpRequest): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/auth/admin/signup`, data)
      .pipe(
        tap((r: any) => {
          this.writeTokensToStorage(r.accessToken, r.refreshToken);
        }
        ))
  }

  currentUser(): AccessToken | null {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return null;
    }
    return jwtDecode<AccessToken>(token);
  }

 get currentUserText(): string {
    const user = this.currentUser();
    if (!user) {
      return "Profile";
    }

    if (user.last_name && user.first_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    return `${user.email}`;
  } 

}