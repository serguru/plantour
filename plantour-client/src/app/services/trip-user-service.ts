import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TripUserDto {
  id: string;
  tripId: string;
  adminParticipantId: string;
  participantStatus?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface CreateTripUserRequest {
  tripId: string;
  adminParticipantId: string;
  participantStatus?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface UpdateTripUserRequest {
  id: string;
  tripId: string;
  adminParticipantId: string;
  participantStatus?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripUserService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/tripuser`;
  }

  getAll(tripId: string): Observable<TripUserDto[]> {
    return this.http.get<TripUserDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string): Observable<TripUserDto> {
    return this.http.get<TripUserDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateTripUserRequest): Observable<TripUserDto> {
    return this.http.post<TripUserDto>(this.apiUrl, request);
  }

  update(request: UpdateTripUserRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
