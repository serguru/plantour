import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface ItineraryPartDto {
  id: string;
  tripId: string;
  name: string;
  category?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface CreateItineraryPartRequest {
  tripId: string;
  name: string;
  category?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface UpdateItineraryPartRequest extends CreateItineraryPartRequest {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class ItineraryService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/Itinerary`;
  }

  getAll(tripId: string): Observable<ItineraryPartDto[]> {
    return this.http.get<ItineraryPartDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string, tripId: string): Observable<ItineraryPartDto> {
    return this.http.get<ItineraryPartDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateItineraryPartRequest): Observable<ItineraryPartDto> {
    return this.http.post<ItineraryPartDto>(this.apiUrl, request);
  }

  update(request: UpdateItineraryPartRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }

  delete(id: string, tripId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }
}