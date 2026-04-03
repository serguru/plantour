import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { AssignmentStatus } from '../helpers/enums';

export interface TripExpenseDto {
  id: string;
  tripUserId: string;
  name: string;
  paymentMethod?: string | null;
  currencyId?: string | null;
  currency?: string | null;
  effectiveCurrencyId?: string | null;
  effectiveCurrency?: string | null;
  rate?: number | null;
  effectiveRate: number;
  amount: number;
  amountInTripCurrency: number;
  recipientId?: string | null;
  recipientEmail?: string | null;
  recipientFirstName?: string | null;
  recipientLastName?: string | null;
  userEmail?: string | null;
  userFirstName?: string | null;
  userLastName?: string | null;
  notes?: string | null;
  shared: boolean;
  recipientFullName?: string | null;
  assignmentStatusText?: string | null;
  assignmentStatusName?: string | null;
  assignmentStatus?: AssignmentStatus | null;
}

export interface CreateTripExpenseRequest {
  tripId: string;
  name: string;
  paymentMethod?: string | null;
  currencyId?: string | null;
  rate?: number | null;
  amount: number;
  recipientId?: string | null;
  notes?: string | null;
  shared: boolean;
}

export interface UpdateTripExpenseRequest {
  id: string;
  tripId: string;
  name: string;
  paymentMethod?: string | null;
  currencyId?: string | null;
  rate?: number | null;
  amount: number;
  recipientId?: string | null;
  notes?: string | null;
  shared: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TripExpenseService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/TripExpense`;
  }

  getAll(tripId: string): Observable<TripExpenseDto[]> {
    return this.http.get<TripExpenseDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getAllForTrip(tripId: string): Observable<TripExpenseDto[]> {
    return this.http.get<TripExpenseDto[]>(`${this.apiUrl}/trip/${tripId}/all`);
  }

  getById(id: string, tripId: string): Observable<TripExpenseDto> {
    return this.http.get<TripExpenseDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  getSuggestedRate(tripId: string, currencyId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/rate/${tripId}/${currencyId}`);
  }

  add(request: CreateTripExpenseRequest): Observable<TripExpenseDto> {
    return this.http.post<TripExpenseDto>(this.apiUrl, request);
  }

  update(request: UpdateTripExpenseRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }

  delete(id: string, tripId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }
}