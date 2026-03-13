import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { MultipleIdsRequest } from './crud-service';
import { findDuplicates, getFullName } from '../helpers/utils';

export interface TripUserDto {
  id: string;
  tripId: string;
  userId: string; // upper one
  adminParticipantId: string;

  packagingComplete: boolean;
  nopackWeightValue?: number | null;
  nopackWeightUnit?: string | null;

  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  notes?: string | null;
  fullName?: string | null;
  totalPacks?: number;
  totalThings?: number;
  totalTodos?: number;
  totalSharedThings?: number;
  totalSharedTodos?: number;
}

export interface CreateTripUserRequest {
  tripId: string;
  adminParticipantId: string;
  notes?: string | null;
  packagingComplete: boolean;
  nopackWeightValue?: number | null;
  nopackWeightUnit?: string | null;
}

export interface UpdateTripUserRequest {
  id: string;
  tripId: string;
  adminParticipantId: string;
  notes?: string | null;
  packagingComplete: boolean;
  nopackWeightValue?: number | null;
  nopackWeightUnit?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripUserService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
   
    this.apiUrl = `${environment.apiUrl}/api/tripuser`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }


  getAll(tripId: string): Observable<TripUserDto[]> {
    return this.http.get<TripUserDto[]>(`${this.apiUrl}/trip/${tripId}`)
    .pipe(
      tap((tripUsers: TripUserDto[]) => {

        const duplicatedIds = findDuplicates(tripUsers);

        tripUsers.forEach((x: TripUserDto) => {
          const isDuplicated = duplicatedIds.some(y => y === x.id);
          const name = getFullName(x.firstName ?? null, x.lastName ?? null, x.email, isDuplicated);
          x.fullName = name;
        });
      }
      ),
    )
  }

  getById(tripId: string, id: string): Observable<TripUserDto> {
    return this.http.get<TripUserDto>(`${this.apiUrl}/trip/${tripId}/user/${id}`);
  }

  getByIdForAll(tripId: string, id: string): Observable<TripUserDto> {
    return this.http.get<TripUserDto>(`${this.apiUrl}/trip/${tripId}/all-users/${id}`);
  }

  add(request: CreateTripUserRequest): Observable<TripUserDto> {
    return this.http.post<TripUserDto>(this.apiUrl, request);
  }

  update(request: UpdateTripUserRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(tripId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/trip/${tripId}/user/${id}`);
  }
}
