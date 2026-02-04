import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { formatToEnglishLocale, getFullName } from '../helpers/utils';
import { UsersService } from './users-service';

export interface TripCommentDto {
  id: string;
  userId: string;
  tripId: string;
  comment: string;
  publishedAt?: string | null;
  fullUserName: string;
  isOwnComment: boolean;
}

export interface CreateTripCommentRequest {
  tripId: string;
  comment: string;
}

export interface UpdateTripCommentRequest {
  id: string;
  comment: string;
  publishedAt?: string | null;
}
@Injectable({
  providedIn: 'root',
})
export class TripCommentService {
  private apiUrl: string;

  usersService = inject(UsersService);

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/TripComment`;
  }

  getAll(tripId: string): Observable<TripCommentDto[]> {

    const currentUserId = this.usersService.getCurrentUserId();

    return this.http.get<TripCommentDto[]>(`${this.apiUrl}/trip/${tripId}`)
    .pipe(
      map(comments => {
        comments?.forEach ((x: any) => {
          x.fullUserName = getFullName(x.firstName, x.lastName, x.email, false); 
          x.publishedAt = x.publishedAt ? formatToEnglishLocale(x.publishedAt) : null;
          x.isOwnComment = x.userId === currentUserId;
        });
        return comments;
      })
    )
  }

  getById(id: string, tripId: string): Observable<TripCommentDto> {
    return this.http.get<TripCommentDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripCommentRequest): Observable<TripCommentDto> {
    return this.http.post<TripCommentDto>(this.apiUrl, request);
  }

  update(request: UpdateTripCommentRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }
}
