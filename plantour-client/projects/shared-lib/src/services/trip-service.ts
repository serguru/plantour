import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../environment.token';
import { TripStatusDto } from './lookup-service';

export interface TripDto {
  id: string;
  tripStatus?: string | null;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CreateTripRequest {
  tripStatus?: string | null;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateTripRequest {
  id: string;
  tripStatus?: string | null;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/trip`;
  }

  public formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getAll(): Observable<TripDto[]> {
    return this.http.get<TripDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<TripDto> {
    return this.http.get<TripDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateTripRequest): Observable<TripDto> {
    return this.http.post<TripDto>(this.apiUrl, request);
  }

  update(request: UpdateTripRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
