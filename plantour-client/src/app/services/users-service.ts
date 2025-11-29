import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { AccessToken } from '../models/auth.models';

interface JwtClaims {
  sub: string;
  email: string;
  exp: number;
  iat: number;
  [key: string]: any; // allows custom claims
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

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
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  get userInfo(): any {
    if (!this.isAuthenticated) {
      return "No authenticated user";
    }

    const user_metadata = jwtDecode<any>(localStorage.getItem("token")!).user_metadata;

    let { email, first_name, last_name } = user_metadata;

    email = (email).trim();
    first_name = (first_name).trim();
    last_name = (last_name).trim();

    const result = first_name && last_name ? `${first_name} ${last_name}` : (
      first_name || last_name || email
    );

    return result;
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

  loginParticipant(accessCode: string): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/auth/participant/signin`, { accessCode })
      .pipe(
        tap((r: any) => {
          let a = jwtDecode(r.accessToken);
          localStorage.setItem("accessToken", r.accessToken);
        }
        ))
  }

  register(data: any): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/auth/signup`, data)
      .pipe(
        tap((r: any) => {
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


}