import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { MultipleIdsRequest } from './crud-service';
import { AddAiThingsRequest, TripThingDto } from './trip-thing-service';
import { AssignmentStatus } from '../helpers/enums';

export interface TripSharedDto {
  id: string;
  category?: string | null;
  name: string;
  units?: string | null;
  value?: number | null;
  notes?: string | null;

  assignedToId?: string | null;
  assignedThingId?: string | null;
  assignedAt: string | null;
  assignedDeadline: string | null;
  rejected: boolean;
  assigneeFinished: string | null;

  assignedThing: TripThingDto | null;
  assigneeEmail?: string | null;
  assigneeFirstName?: string | null;
  assigneeLastName?: string | null;

  assigneeFullName?: string | null;
  assignmentStatusText?: string | null;
  assignmentStatus?: AssignmentStatus | null;
  assignmentStatusName?: string | null;

  currentUserCanAcceptOrReject: boolean;
}
 
export interface CreateTripSharedRequest {
  tripId: string;
  category?: string | null;
  name: string;
  units?: string | null;
  value?: number | null;
  notes?: string | null;
}

export interface UpdateTripSharedRequest {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  units?: string | null;
  value?: number | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripSharedService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.apiUrl}/api/TripShared`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }

  addFromTemplate(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-template`, data);
  }

  deleteFromTemplate(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-template`, data);
  }

  addFromTemplateAi(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-template-ai`, data);
  }

  deleteFromTemplateAi(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-template-ai`, data);
  }

  getAll(tripId: string): Observable<TripSharedDto[]> {
    return this.http.get<TripSharedDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getAllForAssignee(tripId: string, assigneeId: string): Observable<TripSharedDto[]> {
    return this.http.get<TripSharedDto[]>(`${this.apiUrl}/trip/${tripId}/assignee/${assigneeId}`);
  }

  getById(id: string, tripId: string): Observable<TripSharedDto> {
    return this.http.get<TripSharedDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripSharedRequest): Observable<TripSharedDto> {
    return this.http.post<TripSharedDto>(this.apiUrl, request);
  }

  update(request: UpdateTripSharedRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }

  assign(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/assign-trip-shared-things`, data);
  }

  unassign(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/unassign-trip-shared-things`, data);
  }

  toggleAccept(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-accept-trip-shared-things`, data);
  }

  toggleReject(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-reject-trip-shared-things`, data);
  }


}
