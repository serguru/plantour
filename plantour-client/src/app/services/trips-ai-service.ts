import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, timer, throwError } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take } from 'rxjs/operators';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { LoadingService } from './loading-service';

export interface TripAiQuestionDto {
  question: string;
  createdAt: string;
}

export interface TripAiPreviewRequest {
  question: string;
  currencyText: string;
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
  limitsAppliedMessage: string;
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
  limitsAppliedMessage: string;
}

export interface GenerateTripAiImprovementsRequest {
  tripId: string;
  replaceExisting: boolean;
}

export interface TripAiGeneratedImprovementDto {
  id: string;
  name: string;
  notes?: string | null;
  improvementOrder: number;
  finished?: string | null;
}

export interface GenerateTripAiImprovementsResponseDto {
  improvements: TripAiGeneratedImprovementDto[];
  deletedExistingCount: number;
  sharedEntitiesIncluded: boolean;
  scopeSummary: string;
}

interface AiAsyncStartResponseDto {
  requestId: string;
  status: 'pending' | 'completed' | 'failed';
}

interface TripPlanAsyncStatusResponseDto {
  requestId: string;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  result?: TripAiPreviewResponseDto;
}

interface TripEstimateAsyncStatusResponseDto {
  requestId: string;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  result?: GenerateTripAiImprovementsResponseDto;
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
  currencyText: string;
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
  latitude?: number | null;
  longitude?: number | null;
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
  latitude?: number | null;
  longitude?: number | null;
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
  private readonly pollIntervalMs = 1500;
  private readonly pollTimeoutMs = 120000;

  constructor(
    private readonly http: HttpClient,
    private readonly loadingService: LoadingService,
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
    const startUrl = `${this.apiUrl}/trip-plan/preview/start`;
    const statusUrl = `${this.apiUrl}/trip-plan/preview/status`;
    const startTime = Date.now();

    this.loadingService.start();

    return this.http.post<AiAsyncStartResponseDto>(startUrl, request).pipe(
      switchMap(() => timer(0, this.pollIntervalMs).pipe(
        switchMap(() => this.http.post<TripPlanAsyncStatusResponseDto>(statusUrl, request)),
        map(status => {
          if (status.status === 'failed') {
            throw new Error(status.errorMessage || 'AI trip planning failed');
          }

          if (Date.now() - startTime > this.pollTimeoutMs) {
            throw new Error('AI trip planning timeout exceeded');
          }

          return status;
        }),
        filter(status => status.status === 'completed'),
        take(1),
        map(status => {
          if (!status.result) {
            throw new Error('AI trip planning returned no result');
          }
          return status.result;
        })
      )),
      catchError(error => throwError(() => error)),
      finalize(() => this.loadingService.stop())
    );
  }

  createTrip(request: CreateTripFromAiPlanRequest): Observable<TripAiCreateTripResponseDto> {
    return this.http.post<TripAiCreateTripResponseDto>(`${this.apiUrl}/trip-plan/create`, request);
  }

  generateTripImprovements(request: GenerateTripAiImprovementsRequest): Observable<GenerateTripAiImprovementsResponseDto> {
    const startUrl = `${this.apiUrl}/trip-estimate/start`;
    const statusUrl = `${this.apiUrl}/trip-estimate/status`;
    const startTime = Date.now();

    this.loadingService.start();

    return this.http.post<AiAsyncStartResponseDto>(startUrl, request).pipe(
      switchMap(() => timer(0, this.pollIntervalMs).pipe(
        switchMap(() => this.http.post<TripEstimateAsyncStatusResponseDto>(statusUrl, request)),
        map(status => {
          if (status.status === 'failed') {
            throw new Error(status.errorMessage || 'AI trip improvements failed');
          }

          if (Date.now() - startTime > this.pollTimeoutMs) {
            throw new Error('AI trip improvements timeout exceeded');
          }

          return status;
        }),
        filter(status => status.status === 'completed'),
        take(1),
        map(status => {
          if (!status.result) {
            throw new Error('AI trip improvements returned no result');
          }
          return status.result;
        })
      )),
      catchError(error => throwError(() => error)),
      finalize(() => this.loadingService.stop())
    );
  }
}