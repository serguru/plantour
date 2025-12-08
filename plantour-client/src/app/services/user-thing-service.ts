import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';

export interface UserThingDto {
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
export class UserThingService extends CrudService<UserThingDto, CreateUserThingRequest, UpdateUserThingRequest> {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    super();
    this.apiUrl = `${environment.apiUrl}/api/userthing`;
  }

  getAll(): Observable<UserThingDto[]> {
    return this.http.get<UserThingDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<UserThingDto> {
    return this.http.get<UserThingDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateUserThingRequest): Observable<UserThingDto> {
    return this.http.post<UserThingDto>(this.apiUrl, request);
  }

  update(request: UpdateUserThingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
