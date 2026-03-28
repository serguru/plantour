import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface TripAiQuestionDto {
  question: string;
  createdAt: string;
}

export interface TripAiPreviewRequest {
  question: string;
}

export interface CreateTripFromAiPlanRequest {
  question: string;
  currencyId: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ApplyTripAiPlanRequest {
  tripId: string;
  prompt: string;
}

export interface TripAiApplyResponseDto {
  plan: TripAiPlanDto;
  applied: TripAiAppliedCountsDto;
}

export interface TripAiPreviewResponseDto {
  question: string;
  plan: TripAiPlanDto;
  fromCache: boolean;
  datesAdjusted: boolean;
}

export interface TripAiCreateTripResponseDto {
  tripId: string;
  tripName: string;
  plan: TripAiPlanDto;
  applied: TripAiAppliedCountsDto;
}

export interface TripAiAppliedCountsDto {
  itineraryPartsAdded: number;
  personalActivitiesAdded: number;
  publicActivitiesAdded: number;
  personalItemsAdded: number;
  sharedItemsAdded: number;
  personalTodosAdded: number;
  sharedTodosAdded: number;
  personalExpensesAdded: number;
  sharedExpensesAdded: number;
  notesUpdated: boolean;
}

export interface TripAiPlanDto {
  title: string;
  summary: string;
  generalRecommendations: string;
  assumptions: string[];
  suggestedStartDate: string;
  suggestedEndDate: string;
  itinerary: TripAiItineraryPartDto[];
  personalItems: TripAiThingDto[];
  sharedItems: TripAiThingDto[];
  personalTodos: TripAiTodoDto[];
  sharedTodos: TripAiTodoDto[];
  personalExpenses: TripAiExpenseDto[];
  sharedExpenses: TripAiExpenseDto[];
}

export interface TripAiItineraryPartDto {
  name: string;
  category: string;
  address: string;
  notes: string;
  startDate: string;
  endDate: string;
  publicActivities: TripAiActivityDto[];
  personalActivities: TripAiActivityDto[];
}

export interface TripAiActivityDto {
  activity: string;
  name: string;
  notes: string;
  startDate: string;
  endDate: string;
  address: string;
}

export interface TripAiThingDto {
  category: string;
  name: string;
  units: string;
  value: number;
  notes: string;
}

export interface TripAiTodoDto {
  category: string;
  name: string;
  notes: string;
}

export interface TripAiExpenseDto {
  category: string;
  name: string;
  paymentMethod: string;
  amount: number;
  notes: string;
}

@Injectable({
  providedIn: 'root',
})
export class TripsAiService {
  private readonly apiUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(ENVIRONMENT) private readonly environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/templateai`;
  }

  applyTripPlan(request: ApplyTripAiPlanRequest): Observable<TripAiApplyResponseDto> {
    return this.http.post<TripAiApplyResponseDto>(`${this.apiUrl}/trip-plan/apply`, request);
  }

  getLatestQuestions(): Observable<TripAiQuestionDto[]> {
    return this.http.get<TripAiQuestionDto[]>(`${this.apiUrl}/trip-plan/latest-questions`);
  }

  getPreview(request: TripAiPreviewRequest): Observable<TripAiPreviewResponseDto> {
    return this.http.post<TripAiPreviewResponseDto>(`${this.apiUrl}/trip-plan/preview`, request);
  }

  createTrip(request: CreateTripFromAiPlanRequest): Observable<TripAiCreateTripResponseDto> {
    return this.http.post<TripAiCreateTripResponseDto>(`${this.apiUrl}/trip-plan/create`, request);
  }
}