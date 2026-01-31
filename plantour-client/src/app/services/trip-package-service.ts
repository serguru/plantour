import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { MultipleIdsRequest } from './crud-service';

export interface TripPackageDto {
  id: string;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

export interface CreateTripPackageRequest {
  tripId: string;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

export interface UpdateTripPackageRequest {
  id: string;
  tripId: string;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripPackageService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/TripPackage`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }

  getAll(tripId: string): Observable<TripPackageDto[]> {
    return this.http.get<TripPackageDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string, tripId: string): Observable<TripPackageDto> {
    return this.http.get<TripPackageDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripPackageRequest): Observable<TripPackageDto> {
    return this.http.post<TripPackageDto>(this.apiUrl, request);
  }

  update(request: UpdateTripPackageRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }
}
