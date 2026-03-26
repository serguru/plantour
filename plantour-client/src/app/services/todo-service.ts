import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TodoDto {
  id: string;
  category?: string | null;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  isTargeted?: boolean;
}

export interface CreateTodoRequest {
  category?: string | null;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
}

export interface UpdateTodoRequest {
  id: string;
  category?: string | null;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/todo`;
  }

  getAll(): Observable<TodoDto[]> {
    return this.http.get<TodoDto[]>(this.apiUrl);
  }

  getAllForTrip(tripId: string): Observable<TodoDto[]> {
    return this.http.get<TodoDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getAllForSharedTrip(tripId: string): Observable<TodoDto[]> {
    return this.http.get<TodoDto[]>(`${this.apiUrl}/trip-shared/${tripId}`);
  }

  getById(id: string): Observable<TodoDto> {
    return this.http.get<TodoDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateTodoRequest): Observable<TodoDto> {
    return this.http.post<TodoDto>(this.apiUrl, request);
  }

  update(request: UpdateTodoRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}