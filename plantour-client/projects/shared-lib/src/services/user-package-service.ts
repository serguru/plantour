import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../environment.token';

@Injectable({
  providedIn: 'root',
})
export class UserPackageService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/UserPackage`);
  }
}
