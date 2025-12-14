import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';

export interface PackageDto {
  id: string;
  name: string;
  description?: string | null;
}

export interface CreatePackageRequest {
  name: string;
  description?: string | null;
}

export interface UpdatePackageRequest {
  id: string;
  name: string;
  description?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserPackageService extends CrudService<PackageDto, CreatePackageRequest, UpdatePackageRequest> {
  private apiUrl: string;
  public packages: PackageDto[] = [];

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    super();
    this.apiUrl = `${environment.apiUrl}/api/userpackage`;
  }

  getAll(): Observable<PackageDto[]> {
    return this.http.get<PackageDto[]>(this.apiUrl).pipe(
      tap(packages => this.packages = packages)
    );
  }

  getById(id: string): Observable<PackageDto> {
    return this.http.get<PackageDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreatePackageRequest): Observable<PackageDto> {
    return this.http.post<PackageDto>(this.apiUrl, request);
  }

  update(request: UpdatePackageRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
