import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

@Injectable({
  providedIn: 'root',
})
export class UserPackageServiceOld {
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

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/UserPackage/${id}`);
  }

  add(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/UserPackage`, request).pipe(
      tap(() => {
        // Refresh the list after adding
        this.getAll().subscribe();
      })
    );
  }

  update(id: string, request: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/UserPackage/${id}`, request).pipe(
      tap(() => {
        // Refresh the list after updating
        this.getAll().subscribe();
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/UserPackage/${id}`).pipe(
      tap(() => {
        // Refresh the list after deleting
        this.getAll().subscribe();
      })
    );
  }

  getCategories(): Observable<any[]> {
    // Get categories from any existing package or create empty request
    return this.http.get<any>(`${this.apiUrl}/api/UserPackage`).pipe(
      tap(packages => {
        // Store packages
        this.userPackagesSubject.next(packages);
      })
    );
  }

  getUserPackages(): any[] {
    return this.userPackagesSubject.value;
  }

  setUserPackages(packages: any[]): void {
    this.userPackagesSubject.next(packages);
  }
}
