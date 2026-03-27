import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { AssignmentStatus } from '../helpers/enums';

export interface TripSharedExpenseDto {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  paymentMethod?: string | null;
  currencyId?: string | null;
  currency?: string | null;
  effectiveCurrencyId?: string | null;
  effectiveCurrency?: string | null;
  amount: number;
  amountInTripCurrency?: number | null;
  notes?: string | null;
  assignedToId?: string | null;
  assignedExpenseId?: string | null;
  assignedAt?: string | null;
  assignedDeadline?: string | null;
  rejected: boolean;
  assigneeEmail?: string | null;
  assigneeFirstName?: string | null;
  assigneeLastName?: string | null;
  assigneeFullName?: string | null;
  assignmentStatusText?: string | null;
  assignmentStatusName?: string | null;
  assignmentStatus?: AssignmentStatus | null;
  currentUserCanAcceptOrReject: boolean;
}

export interface CreateTripSharedExpenseRequest {
  tripId: string;
  category?: string | null;
  name: string;
  paymentMethod?: string | null;
  currencyId?: string | null;
  amount: number;
  notes?: string | null;
}

export interface UpdateTripSharedExpenseRequest {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  paymentMethod?: string | null;
  currencyId?: string | null;
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

  getAllForAssignee(tripId: string, assigneeId: string): Observable<TripSharedExpenseDto[]> {
    return this.http.get<TripSharedExpenseDto[]>(`${this.apiUrl}/trip/${tripId}/assignee/${assigneeId}`);
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

  assign(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/assign-trip-shared-expenses`, data);
  }

  unassign(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/unassign-trip-shared-expenses`, data);
  }

  toggleAccept(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-accept-trip-shared-expenses`, data);
  }

  toggleReject(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-reject-trip-shared-expenses`, data);
  }
}