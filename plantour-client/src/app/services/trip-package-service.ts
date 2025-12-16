import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { CrudService, FromDicService, MultipleIdsRequest } from './crud-service';

export interface TripPackageDto {
  id: string;
  parentPackageId?: string | null;
  tripUserId: string;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

export interface CreateTripPackageRequest {
  tripId: string;
  parentPackageId?: string | null;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

export interface UpdateTripPackageRequest {
  id: string;
  parentPackageId?: string | null;
  name: string;
  label?: string | null;
  notes?: string | null;
  packingStatus?: string | null;
  packedAt?: string | null;
  packingListIncluded: boolean;
  weightValue?: number | null;
  weightUnit?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TripPackageService implements CrudService<TripPackageDto, CreateTripPackageRequest, UpdateTripPackageRequest>, FromDicService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/TripUserPackage`;
  }

  addFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/insert-from-dic`, data);
  }

  deleteFromDic(data: MultipleIdsRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/delete-from-dic`, data);
  }

  getAll(tripId: string): Observable<TripPackageDto[]> {
    return this.http.get<TripPackageDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getById(id: string): Observable<TripPackageDto> {
    return this.http.get<TripPackageDto>(`${this.apiUrl}/${id}`);
  }

  add(request: CreateTripPackageRequest): Observable<TripPackageDto> {
    return this.http.post<TripPackageDto>(this.apiUrl, request);
  }

  update(request: UpdateTripPackageRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
