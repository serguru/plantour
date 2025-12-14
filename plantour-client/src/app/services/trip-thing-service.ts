import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';

export interface TripUserThingDto {
  id: string;
  tripUserId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
  packageName?: string | null;
  packageLabel?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
}

export interface CreateTripThingRequest {
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
}

export interface UpdateTripThingRequest {
  id: string;
  //tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripThingService extends CrudService<TripUserThingDto, CreateTripThingRequest, UpdateTripThingRequest> {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    super();
    this.apiUrl = `${environment.apiUrl}/api/TripUserThing`;
  }

  getAll(tripId: string): Observable<TripUserThingDto[]> {
    return this.http.get<TripUserThingDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string): Observable<TripUserThingDto> {
    return this.http.get<TripUserThingDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateTripThingRequest): Observable<TripUserThingDto> {
    return this.http.post<TripUserThingDto>(this.apiUrl, request);
  }

  update(request: UpdateTripThingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
