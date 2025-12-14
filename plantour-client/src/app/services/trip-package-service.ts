import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';

export interface TripUserPackageDto {
  id: string;
  parentPackageId?: string | null;
  tripUserId: string;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

export interface CreateTripPackageRequest {
  tripId: string;
  parentPackageId?: string | null;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

export interface UpdateTripPackageRequest {
  id: string;
  parentPackageId?: string | null;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripPackageService extends CrudService<TripUserPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest> {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    super();
    this.apiUrl = `${environment.apiUrl}/api/TripUserPackage`;
  }

  getAll(tripId: string): Observable<TripUserPackageDto[]> {
    return this.http.get<TripUserPackageDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string): Observable<TripUserPackageDto> {
    return this.http.get<TripUserPackageDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateTripPackageRequest): Observable<TripUserPackageDto> {
    return this.http.post<TripUserPackageDto>(this.apiUrl, request);
  }

  update(request: UpdateTripPackageRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
