import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { MultipleIdsRequest } from './crud-service';
import { AssignmentStatus } from '../helpers/enums';
import { AiItemDto } from './template-ai-service';

export interface TripThingDto {
  id: string;
  category?: string | null;
  name: string;
  units?: string | null;
  value?: number | null;
  notes?: string | null;

  tripUserPackageId?: string | null;
  packageName?: string | null;
  packageLabel?: string | null;

  tripSharedThingId: string | null; 
  assignedAt: string | null;
  assignedDeadline: string | null;
 
  finished: string | null;

  assignmentStatus?: AssignmentStatus | null;
  assignmentStatusText?: string | null;

  packageText?: string | null;
  


 }


export interface CreateTripThingRequest {
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
}

export interface UpdateTripThingRequest {
  id: string;
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
}

export interface AddAiThingsRequest {
  tripId: string;
  things: AiItemDto[];
}

@Injectable({
  providedIn: 'root',
})
export class TripThingService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.api.baseUrl}/TripThing`;
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


  getAll(tripId: string): Observable<TripThingDto[]> {
    return this.http.get<TripThingDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getAllForPackage(tripId: string, packageId: string): Observable<TripThingDto[]> {
    return this.http.get<TripThingDto[]>(`${this.apiUrl}/trip/${tripId}/package/${packageId}`);
  }

  getById(id: string, tripId: string): Observable<TripThingDto> {
    return this.http.get<TripThingDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripThingRequest): Observable<TripThingDto> {
    return this.http.post<TripThingDto>(this.apiUrl, request);
  }

  update(request: UpdateTripThingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }

  pack(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/pack-trip-things`, data);
  }

  unpack(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/unpack-trip-things`, data);
  }

  toggleFinished(data: any): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/toggle-finished-trip-things`, data);
  }


}
