import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { SignUpParticipantRequest } from '../models/auth.models';
import { UsersService } from './users-service';
import { PackageDto } from './package-service';
import { findDuplicates, getFullName } from '../helpers/utils';


export enum CheckParticipantStatus
{
    AlreadyParticipant = 1,
    UserExistsNotParticipant = 2,
    NotFound = 3
}

export interface CheckParticipantResponse {
    foundUserId?: string;
    status: CheckParticipantStatus;
}


export interface AdminsParticipantDto {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  notes?: string | null;
  fullName?: string | null;
}

export interface UpdateAdminsParticipantRequest {
  id: string;
  participantId: string;
  notes?: string | null;
}


// TODO: if a participant is deleted all their assignments must be deleted as well
@Injectable({
  providedIn: 'root',
})
export class AdminsParticipantService {
  private apiUrl: string;
  private usersService = inject(UsersService)

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.apiUrl}/api/AdminsParticipant`;
  }

  private setFullNames = (users: AdminsParticipantDto[]) => {
    users.forEach((x: AdminsParticipantDto) => {
      const name = getFullName(x.firstName ?? null, x.lastName ?? null, x.email, false);
      x.fullName = name;
    });
  }

  getAll(): Observable<AdminsParticipantDto[]> {
    return this.http.get<AdminsParticipantDto[]>(this.apiUrl).pipe(
      tap(users => {
        this.setFullNames(users);
      })
    );
  }

  getAllForTrip(tripId: string): Observable<AdminsParticipantDto[]> {
    return this.http.get<AdminsParticipantDto[]>(`${this.apiUrl}/trip/${tripId}`).pipe(
      tap(users => {
        this.setFullNames(users);
      })
    );
  }

  getById(id: string): Observable<AdminsParticipantDto> {
    return this.http.get<AdminsParticipantDto>(`${this.apiUrl}/${id}`);
  }

  add(request: SignUpParticipantRequest): Observable<AdminsParticipantDto> {
    return this.usersService.registerParticipant(request);
  }

  update(request: UpdateAdminsParticipantRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkParticipantByEmail(email: string): Observable<CheckParticipantResponse> {
    return this.http.get<CheckParticipantResponse>(`${this.apiUrl}/check-participant/${encodeURIComponent(email)}`);
  }

}
