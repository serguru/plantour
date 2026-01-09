import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService, MultipleIdsRequest } from './crud-service';

export interface ThingDto {
  id: string;
  userId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: string | null;
  common: boolean;
}

export interface CreateThingRequest {
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: string | null;
  common: boolean;
}

export interface UpdateThingRequest {
  id: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: string | null;
  common: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ThingService implements CrudService<ThingDto, CreateThingRequest, UpdateThingRequest> {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
   
    this.apiUrl = `${environment.apiUrl}/api/thing`;
  }

  getAll(): Observable<ThingDto[]> {
    return this.http.get<ThingDto[]>(this.apiUrl);
  }

  getAllForTrip(tripId: string): Observable<ThingDto[]> {
    return this.http.get<ThingDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }
  
  getAllForSharedTrip(tripId: string): Observable<ThingDto[]> {
    return this.http.get<ThingDto[]>(`${this.apiUrl}/trip-shared/${tripId}`);
  }


  getById(id: string): Observable<ThingDto> {
    return this.http.get<ThingDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateThingRequest): Observable<ThingDto> {
    return this.http.post<ThingDto>(this.apiUrl, request);
  }

  update(request: UpdateThingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  addFromTemplate(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-template`, data);
  }

  deleteFromTemplate(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-template`, data);
  }

}
