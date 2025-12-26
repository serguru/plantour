import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService, FromDicService, MultipleIdsRequest, PackingService } from './crud-service';
import { TripUserDto } from './trip-user-service';

export interface TripSharedDto {
  id: string;
  tripUserId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
  packageName?: string | null;
  packageLabel?: string | null;
  packedAt?: string | null;
  assignedByUserId: string | null;
  assigned: TripUserDto | null;
  assignedAt: string | null;
  assignedDeadline: string | null;
  finished: string | null;
  common: boolean;
}


export interface CreateTripSharedRequest {
  tripId: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
  packedAt?: string | null;
  finished: string | null;
  common: boolean;
}

export interface UpdateTripSharedRequest {
  id: string;
  category?: string | null;
  name: string;
  notes?: string | null;
  units?: string | null;
  value?: number | null;
  tripUserPackageId?: string | null;
  packedAt?: string | null;
  finished: string | null;
  common: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TripSharedService implements CrudService<TripSharedDto, CreateTripSharedRequest, UpdateTripSharedRequest>, FromDicService, PackingService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.apiUrl}/api/TripShared`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }


  getAll(tripId: string): Observable<TripSharedDto[]> {
    return this.http.get<TripSharedDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string, tripId: string): Observable<TripSharedDto> {
    return this.http.get<TripSharedDto>(`${this.apiUrl}/${tripId}/${id}`);
  }

  add(request: CreateTripSharedRequest): Observable<TripSharedDto> {
    return this.http.post<TripSharedDto>(this.apiUrl, request);
  }

  update(request: UpdateTripSharedRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string, tripId: string | null): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tripId}/${id}`);
  }

  pack(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/pack-trip-shareds`, data);
  }

  unpack(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/unpack-trip-shareds`, data);
  }

}
