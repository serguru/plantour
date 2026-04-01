import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TripImprovementDto {
  id: string;
  name: string;
  notes?: string | null;
  improvementOrder: number;
  finished?: string | null;
  reviewStatusText?: string | null;
}

export interface CreateTripImprovementRequest {
  tripId: string;
  name: string;
  notes?: string | null;
  improvementOrder: number;
  finished?: string | null;
}

export interface UpdateTripImprovementRequest {
  id: string;
  tripId: string;
  name: string;
  notes?: string | null;
  improvementOrder: number;
  finished?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripImprovementService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/TripImprovement`;
  }

  getAll(tripId: string): Observable<TripImprovementDto[]> {
    return this.http.get<TripImprovementDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string, tripId: string): Observable<TripImprovementDto> {
    return this.http.get<TripImprovementDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripImprovementRequest): Observable<TripImprovementDto> {
    return this.http.post<TripImprovementDto>(this.apiUrl, request);
  }

  update(request: UpdateTripImprovementRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }

  toggleFinished(data: { id: string; tripId: string; finished: string | null }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/toggle-finished-trip-improvements`, data);
  }
}