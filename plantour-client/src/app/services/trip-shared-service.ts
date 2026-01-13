import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService, FromDicService, MultipleIdsRequest, PackingService } from './crud-service';
import { TripThingDto } from './trip-thing-service';
import { UserDto } from './users-service';

export interface TripSharedDto {
  id: string;
  tripUserId: string;
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
  assignedThing: TripThingDto | null;
  assignedTo: UserDto | null;
}

export interface CreateTripSharedRequest {
  tripId: string;
  category?: string | null;
  name: string;
  units?: string | null;
  value?: number | null;
  notes?: string | null;
  assignedToId?: string | null;
  assignedDeadline?: string | null;
}

export interface UpdateTripSharedRequest {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  units?: string | null;
  value?: number | null;
  notes?: string | null;
  assignedToId?: string | null;
  assignedDeadline?: string | null;
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

  assign(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/assign-trip-shared-things`, data);
  }

  unassign(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/unassign-trip-shared-things`, data);
  }
}
