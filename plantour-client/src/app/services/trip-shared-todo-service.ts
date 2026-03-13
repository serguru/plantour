import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { MultipleIdsRequest } from './crud-service';
import { AssignmentStatus } from '../helpers/enums';

export interface TripSharedTodoDto {
  id: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  assignedToId?: string | null;
  assignedTodoId?: string | null;
  assignedAt: string | null;
  assignedDeadline: string | null;
  rejected: boolean;
  assigneeFinished: string | null;
  assigneeEmail?: string | null;
  assigneeFirstName?: string | null;
  assigneeLastName?: string | null;
  assigneeFullName?: string | null;
  assignmentStatusText?: string | null;
  assignmentStatus?: AssignmentStatus | null;
  assignmentStatusName?: string | null;
  currentUserCanAcceptOrReject: boolean;
}

export interface CreateTripSharedTodoRequest {
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
}

export interface UpdateTripSharedTodoRequest {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripSharedTodoService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/TripSharedTodo`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }

  getAll(tripId: string): Observable<TripSharedTodoDto[]> {
    return this.http.get<TripSharedTodoDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getAllForAssignee(tripId: string, assigneeId: string): Observable<TripSharedTodoDto[]> {
    return this.http.get<TripSharedTodoDto[]>(`${this.apiUrl}/trip/${tripId}/assignee/${assigneeId}`);
  }

  getById(id: string, tripId: string): Observable<TripSharedTodoDto> {
    return this.http.get<TripSharedTodoDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripSharedTodoRequest): Observable<TripSharedTodoDto> {
    return this.http.post<TripSharedTodoDto>(this.apiUrl, request);
  }

  update(request: UpdateTripSharedTodoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }

  assign(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/assign-trip-shared-todos`, data);
  }

  unassign(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/unassign-trip-shared-todos`, data);
  }

  toggleAccept(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-accept-trip-shared-todos`, data);
  }

  toggleReject(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-reject-trip-shared-todos`, data);
  }
}