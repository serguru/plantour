import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../environment.token';

export interface UserThingDto {
  id: string;
  userId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  shortDescription: string;
  description?: string | null;
}

export interface CreateUserThingRequest {
  categoryId?: string | null;
  shortDescription: string;
  description?: string | null;
}

export interface UpdateUserThingRequest {
  thingId: string;
  categoryId?: string | null;
  shortDescription: string;
  description?: string | null;
}

export interface ThingCategoryDto {
  id: string;
  name: string;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserThingService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
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

  getAllCategories(): Observable<ThingCategoryDto[]> {
    return this.http.get<ThingCategoryDto[]>(`${this.apiUrl}/categories`);
  }
}
