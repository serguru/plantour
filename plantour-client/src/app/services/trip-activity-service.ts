import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TripActivityDto {
  id: string;
  tripUserId?: string | null;
  itineraryPartId?: string | null;
  activity?: string | null;
  name: string;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateTripActivityRequest {
  tripId: string;
  itineraryPartId?: string | null;
  activity?: string | null;
  name: string;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateTripActivityRequest {
  id: string;
  itineraryPartId?: string | null;
  activity?: string | null;
  name: string;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripActivityService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/TripActivity`;
  }

  getAllPublic(tripId: string): Observable<TripActivityDto[]> {
    return this.http.get<TripActivityDto[]>(`${this.apiUrl}/trip/${tripId}/public`);
  }

  getAllPersonal(tripId: string): Observable<TripActivityDto[]> {
    return this.http.get<TripActivityDto[]>(`${this.apiUrl}/trip/${tripId}/personal`);
  }

  getPublicById(tripId: string, id: string): Observable<TripActivityDto> {
    return this.http.get<TripActivityDto>(`${this.apiUrl}/trip/${tripId}/public/${id}`);
  }

  getPersonalById(tripId: string, id: string): Observable<TripActivityDto> {
    return this.http.get<TripActivityDto>(`${this.apiUrl}/trip/${tripId}/personal/${id}`);
  }

  addPublic(request: CreateTripActivityRequest): Observable<TripActivityDto> {
    return this.http.post<TripActivityDto>(`${this.apiUrl}/public`, request);
  }

  addPersonal(request: CreateTripActivityRequest): Observable<TripActivityDto> {
    return this.http.post<TripActivityDto>(`${this.apiUrl}/personal`, request);
  }

  updatePublic(request: UpdateTripActivityRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/public`, request);
  }

  updatePersonal(request: UpdateTripActivityRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/personal`, request);
  }

  deletePublic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/public/${id}`);
  }

  deletePersonal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/personal/${id}`);
  }
}