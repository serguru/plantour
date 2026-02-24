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

    allowedItems: number;
    allowedTravelers: number;
    allowedAiPrompts: number;
    extendedAiAllowed: boolean;

    prices: PriceDto[];
}

export interface LandingDto
{
    plans: PlanDto[];
    guestPlanDurationDays: string;
}

@Injectable({
  providedIn: 'root',
})
export class LandingService {

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }
  private apiUrl: string;

  getLandingData(): Observable<LandingDto> {
    return this.http.get<LandingDto>(`${this.apiUrl}/api/users/landing`);
  }
  
  
}
