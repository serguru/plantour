import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TripSharedExpenseDto {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  amount: number;
  notes?: string | null;
}

export interface CreateTripSharedExpenseRequest {
  tripId: string;
  category?: string | null;
  name: string;
  amount: number;
  notes?: string | null;
}

export interface UpdateTripSharedExpenseRequest {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  amount: number;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripSharedExpenseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/TripSharedExpense`;
  }

  getAll(tripId: string): Observable<TripSharedExpenseDto[]> {
    return this.http.get<TripSharedExpenseDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string, tripId: string): Observable<TripSharedExpenseDto> {
    return this.http.get<TripSharedExpenseDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripSharedExpenseRequest): Observable<TripSharedExpenseDto> {
    return this.http.post<TripSharedExpenseDto>(this.apiUrl, request);
  }

  update(request: UpdateTripSharedExpenseRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }

  delete(id: string, tripId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }
}