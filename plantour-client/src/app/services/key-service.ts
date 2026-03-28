import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface KeyDto {
  id: string;
  name: string;
  key: string;
  active: boolean;
  createdAt: string;
  notes?: string | null;
}

export interface CreateKeyRequest {
  name: string;
  key: string;
  active: boolean;
  notes?: string | null;
}

export interface UpdateKeyRequest {
  id: string;
  name: string;
  key: string;
  active: boolean;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/key`;
  }

  getAll(): Observable<KeyDto[]> {
    return this.http.get<KeyDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<KeyDto> {
    return this.http.get<KeyDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateKeyRequest): Observable<KeyDto> {
    return this.http.post<KeyDto>(this.apiUrl, request);
  }

  update(request: UpdateKeyRequest): Observable<void> {
    return this.http.put<void>(this.apiUrl, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}