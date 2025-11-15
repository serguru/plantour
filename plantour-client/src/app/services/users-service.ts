import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get weather forecast from the backend.
   * Sends GET to `${apiUrl}/weatherforecast` and returns the parsed JSON.
   */
  getWeather(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/weatherforecast`);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/profile/me`);
  }



}