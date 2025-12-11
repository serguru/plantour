import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';

export interface UserPackageDto {
  id: string;
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
export class UserPackageService extends CrudService<UserPackageDto, CreateUserPackageRequest, UpdateUserPackageRequest> {
  private apiUrl: string;
  public packages: UserPackageDto[] = [];

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    super();
    this.apiUrl = `${environment.apiUrl}/api/userpackage`;
  }

  getAll(): Observable<UserPackageDto[]> {
    return this.http.get<UserPackageDto[]>(this.apiUrl).pipe(
      tap(packages => this.packages = packages)
    );
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

}
