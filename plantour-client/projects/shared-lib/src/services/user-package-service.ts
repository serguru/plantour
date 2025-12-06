import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../environment.token';

export interface UserPackageDto {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
}

export interface CreateUserPackageRequest {
  name: string;
  description?: string | null;
}

export interface UpdateUserPackageRequest {
  packageId: string;
  name: string;
  description?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserPackageService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/userpackage`;
  }

  getAll(): Observable<UserPackageDto[]> {
    return this.http.get<UserPackageDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<UserPackageDto> {
    return this.http.get<UserPackageDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateUserPackageRequest): Observable<UserPackageDto> {
    return this.http.post<UserPackageDto>(this.apiUrl, request);
  }

  update(request: UpdateUserPackageRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // getAllCategories(): Observable<PackageCategoryDto[]> {
  //   return this.http.get<PackageCategoryDto[]>(`${this.apiUrl}/categories`);
  // }
}
