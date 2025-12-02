import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../environment.token';

@Injectable({
  providedIn: 'root',
})
export class UserPackageService {
  private apiUrl: string;
  private userPackagesSubject = new BehaviorSubject<any[]>([]);
  userPackages$ = this.userPackagesSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/UserPackage`).pipe(
      tap(packages => this.userPackagesSubject.next(packages))
    );
  }

  getUserPackages(): any[] {
    return this.userPackagesSubject.value;
  }

  setUserPackages(packages: any[]): void {
    this.userPackagesSubject.next(packages);
  }
}
