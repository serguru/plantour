import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';


export interface CommunicationTypeDto {
  id: string;
  name: string;
  notes?: string | null;
}

export interface ThingCategoryDto {
  id: string;
  name: string;
  notes?: string | null;
}

export interface TripStatusDto {
  id: string;
  name: string;
}

export interface ParticipantStatusDto {
  id: string;
  name: string;
  notes?: string | null;
}

export interface UnitDto {
  id: string;
  name: string;
}

export interface LookupsResponse {
  communicationTypes: CommunicationTypeDto[];
  thingCategories: ThingCategoryDto[];
  tripStatuses: TripStatusDto[];
  participantStatuses: ParticipantStatusDto[];
  units: UnitDto[];
}

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  private apiUrl: string;
  private lookups: LookupsResponse | null = null;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/lookups`;
  }

  private loadLookupsIfNeeded(): Observable<LookupsResponse> {
    if (this.lookups) {
      return of(this.lookups);
    }

    return this.http.get<LookupsResponse>(this.apiUrl).pipe(
      tap((response) => {
        this.lookups = response;
      })
    );
  }

  getCommunicationTypes(): Observable<CommunicationTypeDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.communicationTypes);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  

  getThingCategories(): Observable<ThingCategoryDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.thingCategories);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  thingCategories$ = this.getThingCategories();

  getTripStatuses(): Observable<TripStatusDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.tripStatuses);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
  tripStatuses$ = this.getTripStatuses();


  getParticipantStatuses(): Observable<ParticipantStatusDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.participantStatuses);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
  participantStatuses$ = this.getParticipantStatuses();

  getUnits(): Observable<UnitDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.units);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  units$ = this.getUnits();

}
