import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { MultipleIdsRequest } from './crud-service';
import { AssignmentStatus } from '../helpers/enums';

export interface TripTodoDto {
  id: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  tripSharedTodoId: string | null;
  assignedAt: string | null;
  assignedDeadline: string | null;
  finished: string | null;
  assignmentStatus?: AssignmentStatus | null;
  assignmentStatusText?: string | null;
  assignmentStatusName?: string | null;
}

export interface CreateTripTodoRequest {
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
}

export interface UpdateTripTodoRequest {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripTodoService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/TripTodo`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }

  getAll(tripId: string): Observable<TripTodoDto[]> {
    return this.http.get<TripTodoDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string, tripId: string): Observable<TripTodoDto> {
    return this.http.get<TripTodoDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripTodoRequest): Observable<TripTodoDto> {
    return this.http.post<TripTodoDto>(this.apiUrl, request);
  }

  update(request: UpdateTripTodoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }

  toggleFinished(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-finished-trip-todos`, data);
  }
}