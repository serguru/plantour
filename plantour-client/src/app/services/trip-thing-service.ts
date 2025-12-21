import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService, FromDicService, MultipleIdsRequest, PackingService } from './crud-service';
import { TripUserDto } from './trip-user-service';

export interface TripThingDto {
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


export interface CreateTripThingRequest {
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

export interface UpdateTripThingRequest {
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
export class TripThingService implements CrudService<TripThingDto, CreateTripThingRequest, UpdateTripThingRequest>, FromDicService, PackingService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.apiUrl}/api/TripUserThing`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }


  getAll(tripId: string): Observable<TripThingDto[]> {
    return this.http.get<TripThingDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string): Observable<TripThingDto> {
    return this.http.get<TripThingDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateTripThingRequest): Observable<TripThingDto> {
    return this.http.post<TripThingDto>(this.apiUrl, request);
  }

  update(request: UpdateTripThingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  pack(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/pack-trip-things`, data);
  }

  unpack(data: MultipleIdsRequest): Observable<number> {
    return this.http.put<number>(`${this.apiUrl}/unpack-trip-things`, data);
  }

}
