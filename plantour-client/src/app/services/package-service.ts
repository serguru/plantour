import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';

export interface PackageDto {
  id: string;
  name: string;
  notes?: string | null;
  isTargeted: boolean;
}

export interface CreatePackageRequest {
  name: string;
  notes?: string | null;
}

export interface UpdatePackageRequest {
  id: string;
  name: string;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
   
    this.apiUrl = `${environment.apiUrl}/api/package`;
  }

  getAll(): Observable<PackageDto[]> {
    return this.http.get<PackageDto[]>(this.apiUrl);
  }

  getAllForTrip(tripId: string): Observable<PackageDto[]> {
    return this.http.get<PackageDto[]>(`${this.apiUrl}/trip/${tripId}`);
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
