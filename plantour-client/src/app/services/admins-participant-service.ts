import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService } from './crud-service';
import { SignUpParticipantRequest } from '../models/auth.models';
import { UsersService } from './users-service';

export interface AdminsParticipantDto {
  id: string;
  adminId: string;
  participantId: string;
  participantStatus?: string | null;
  accessCode: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  notes?: string | null;
}

// export interface CreateAdminsParticipantRequest {
//   participantId: string;
//   participantStatus?: string | null;
//   email: string;
//   firstName?: string | null;
//   lastName?: string | null;
//   phone?: string | null;
//   notes?: string | null;
// }

export interface UpdateAdminsParticipantRequest {
  id: string;
  participantId: string;
  participantStatus?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminsParticipantService implements CrudService<AdminsParticipantDto, SignUpParticipantRequest, UpdateAdminsParticipantRequest> {
  private apiUrl: string;
  private usersService = inject(UsersService)

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
   
    this.apiUrl = `${environment.apiUrl}/api/AdminsParticipant`;
  }

  getAll(): Observable<AdminsParticipantDto[]> {
    return this.http.get<AdminsParticipantDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<AdminsParticipantDto> {
    return this.http.get<AdminsParticipantDto>(`${this.apiUrl}/${id}`);
  }

  getByEmail(email: string): Observable<AdminsParticipantDto> {
    return this.http.get<AdminsParticipantDto>(`${this.apiUrl}/email/${email}`);
  }

  add(request: SignUpParticipantRequest): Observable<AdminsParticipantDto> {
    return this.usersService.registerParticipant(request);
//    return this.http.post<AdminsParticipantDto>(this.apiUrl, request);
  }




  update(request: UpdateAdminsParticipantRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
