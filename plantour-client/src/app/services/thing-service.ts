import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { ArrayOfGuidsRequest } from './crud-service';
import { AiItemDto } from './template-ai-service';

export interface ThingDto {
  id: string;
  userId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
}

export interface CreateThingRequest {
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
}

export interface UpdateThingRequest {
  id: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class ThingService {
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

  // TODO: why does it call for latest prompts when navigated to other component?

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  addFromTemplate(data: ArrayOfGuidsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-template`, data);
  }

  deleteFromTemplate(data: ArrayOfGuidsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-template`, data);
  }

  addFromAITemplate(items: AiItemDto[]): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-ai-template`, items);
  }
}
