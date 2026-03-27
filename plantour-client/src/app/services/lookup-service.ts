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

export interface CurrencyDto {
  id: string;
  name: string;
}

export interface ItineraryPartCategoryDto {
  id: string;
  name: string;
}

export interface PaymentMethodDto {
  id: string;
  name: string;
}

export interface ThingCategoryDto {
  id: string;
  name: string;
  notes?: string | null;
}

export interface TodoCategoryDto {
  id: string;
  name: string;
  notes?: string | null;
}

export interface TripStatusDto {
  id: string;
  name: string;
}

export interface UnitDto {
  id: string;
  name: string;
}

export interface LookupsResponse {
  communicationTypes: CommunicationTypeDto[];
  currencies: CurrencyDto[];
  itineraryPartCategories: ItineraryPartCategoryDto[];
  paymentMethods: PaymentMethodDto[];
  thingCategories: ThingCategoryDto[];
  todoCategories: TodoCategoryDto[];
  tripStatuses: TripStatusDto[];
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
    this.apiUrl = `${environment.api.baseUrl}/lookups`;
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

  getCurrencies(): Observable<CurrencyDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.currencies);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  currencies$ = this.getCurrencies();

  getItineraryPartCategories(): Observable<ItineraryPartCategoryDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.itineraryPartCategories);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  itineraryPartCategories$ = this.getItineraryPartCategories();

  getPaymentMethods(): Observable<PaymentMethodDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.paymentMethods);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  paymentMethods$ = this.getPaymentMethods();

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

  getTodoCategories(): Observable<TodoCategoryDto[]> {
    return new Observable((observer) => {
      this.loadLookupsIfNeeded().subscribe({
        next: (lookups) => {
          observer.next(lookups.todoCategories);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  todoCategories$ = this.getTodoCategories();

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
