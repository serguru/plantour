import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = environment.apiUrl + "/api";

  constructor(private http: HttpClient) { }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile/me`);
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(`${this.apiUrl}/auth/signin`, { email, password })
      .pipe(map(resp => resp.accessToken));
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  logout() {
    localStorage.removeItem('jwt');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }


}