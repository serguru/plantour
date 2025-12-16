import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';

export interface ThingDto {
  id: string;
  userId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: string | null;
}

export interface CreateUserThingRequest {
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: string | null;
}

export interface UpdateUserThingRequest {
  id: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserThingService implements CrudService<ThingDto, CreateUserThingRequest, UpdateUserThingRequest> {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
   
    this.apiUrl = `${environment.apiUrl}/api/userthing`;
  }

  getAll(): Observable<ThingDto[]> {
    return this.http.get<ThingDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<ThingDto> {
    return this.http.get<ThingDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateUserThingRequest): Observable<ThingDto> {
    return this.http.post<ThingDto>(this.apiUrl, request);
  }

  update(request: UpdateUserThingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
