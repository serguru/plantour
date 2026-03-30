import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TripNoteDto {
  id: string;
  tripUserId?: string | null;
  tripActivityId?: string | null;
  tripActivityName?: string | null;
  title: string;
  contentJson?: string | null;
  createdAt?: string | null;
}

export interface CreateTripNoteRequest {
  tripId: string;
  tripActivityId?: string | null;
  title: string;
  contentJson?: string | null;
}

export interface UpdateTripNoteRequest {
  id: string;
  tripId: string;
  tripActivityId?: string | null;
  title: string;
  contentJson?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripNoteService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/TripNote`;
  }

  getAll(tripId: string): Observable<TripNoteDto[]> {
    return this.http.get<TripNoteDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string, tripId: string): Observable<TripNoteDto> {
    return this.http.get<TripNoteDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripNoteRequest): Observable<TripNoteDto> {
    return this.http.post<TripNoteDto>(this.apiUrl, request);
  }

  update(request: UpdateTripNoteRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }

  delete(id: string, tripId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }
}