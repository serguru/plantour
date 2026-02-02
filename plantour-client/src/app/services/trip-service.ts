import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { get } from 'https';

export interface TripDto {
  id: string;
  tripStatusId: string | null;
  tripStatus: string | null;
  name: string;

  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;


  totalDays: number;
  totalParticipants: number;
  totalPacks: number;
 // totalThings: number;
  currentUserIncluded: boolean;

  totalSharedThings: number;
  daysLeft: number;
  daysLeftText: string | null;
  totalSharedThingsDone: number;
  totalSharedThingsOverdue: number;
  totalPackWeightsStr: string | null;
  userTotalPacks: number;
  userTotalSharedThings: number;
  userTotalSharedThingsDone: number;
  userTotalSharedThingsOverdue: number;
  userTotalPackWeightsStr: string | null;
}
export interface CreateTripRequest {
  tripStatusId: string | null;
  name: string;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateTripRequest {
  id: string;
  tripStatusId: string | null;
  name: string;
  notes?: string | null;
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

  getAll(): Observable<TripDto[]> {
    return this.http.get<TripDto[]>(`${this.apiUrl}`);
  }

  getAllWhereParticipant(): Observable<TripDto[]> {
    return this.http.get<TripDto[]>(`${this.apiUrl}/where-participant`);
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
