import { Inject, inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { UsersService } from './users-service';
import { TripService } from './trip-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalStorageService } from './local-storage-service';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface DashboardTripDto {
    id: string,
    tripStatus: string,
    name: string,
    notes?: string,
    fromTo?: string,
    currentUserIncluded: boolean,
    daysLeft?: number,
    daysLeftText?: string
}

export interface DashboardUserTripDto {
    id: string;
    packs: number;
    items: number;
    sharedAssigned: number;
    sharedPending: number;
    sharedOverdue: number;
    sharedSuccess: number;
    sharedFailure: number;
    weightStr: string;
}


export interface DashboardAllUsersTripDto
{
    id: string;
    packs: number;
    sharedAssigned: number;
    sharedPending: number;
    sharedOverdue: number;
    sharedSuccess: number;
    sharedFailure: number;
    weightStr: string;
    packingProgress: number;
}


@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(ENVIRONMENT) private environment: EnvironmentConfig
    ) {

        this.apiUrl = `${environment.apiUrl}/api/dashboard`;
    }

    getDashboardTripDto(tripId: string): Observable<DashboardTripDto> {
        return this.http.get<DashboardTripDto>(`${this.apiUrl}/trip/${tripId}`);
    }

    getDashboardUserTripDto(tripId: string): Observable<DashboardUserTripDto> {
        return this.http.get<DashboardUserTripDto>(`${this.apiUrl}/user-trip/${tripId}`);
    }

    getDashboardAllUsersTripDto(tripId: string): Observable<DashboardAllUsersTripDto> {
        return this.http.get<DashboardAllUsersTripDto>(`${this.apiUrl}/all-users-trip/${tripId}`);
    }

}
