import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { HttpClient } from '@angular/common/http';
import { PlanPrice } from '../helpers/enums';

export interface PriceDto
{
    id: string;
    planId: string;
    paddlePriceId: string;
    name: string;
    planPriceIndex: PlanPrice;
    valueCents: number;
    notes?: string;
}

export interface PlanDto
{
    id: string;
    name: string;
    notes?: string;
    active?: boolean;
    createdAt: string;

    allowedItems: number | null;
    allowedTravelers: number | null;
    allowedTodos: number | null;
    allowedExpenses: number | null;
    allowedItineraryParts: number | null;
    allowedActivities: number | null;
    allowedAiPrompts: number | null;
    extendedAiAllowed: boolean;

    prices: PriceDto[];
}

export interface LandingDto
{
    plans: PlanDto[];
}

@Injectable({
  providedIn: 'root',
})
export class LandingService {

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.api.baseUrl;
  }
  private apiUrl: string;

  getLandingData(): Observable<LandingDto> {
    return this.http.get<LandingDto>(`${this.apiUrl}/users/landing`);
  }
  
  
}
