import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { Observable, timer, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, takeWhile } from 'rxjs/operators';
import { LoadingService } from './loading-service';

export interface AiItemDto {
  id: string;
  category: string;
  name: string;
  units: string;
  value: number;
  notes: string;
  isTargeted?: boolean;
}

export interface AiPromptDto {
  id: string;
  prompt: string;
}

export interface AiItemsRequest {
  tripId?: string;
  prompt: string;
}

interface AiAsyncStartResponseDto {
  requestId: string;
  status: 'pending' | 'completed' | 'failed';
}

interface AiItemsAsyncStatusResponseDto {
  requestId: string;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  items: AiItemDto[];
}

@Injectable({
  providedIn: 'root',
})
export class TemplatesAiService {
  private apiUrl: string;
  private readonly pollIntervalMs = 1500;
  private readonly pollTimeoutMs = 120000;

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.api.baseUrl}/templateai`;
  }
  // Returns the latest AI prompts used
  getLatestPrompts(): Observable<AiPromptDto[]> {
    return this.http.get<AiPromptDto[]>(`${this.apiUrl}/latest-prompts`);
  }
  
  // Returns AI generated items based on the provided prompt
  getAllByPrompt(prompt: string): Observable<AiItemDto[]> {
    return this.runItemsAsync({ prompt, targetMode: 'all' });
  }

  getAllForTrip(tripId: string, prompt: string): Observable<AiItemDto[]> {
    return this.runItemsAsync({ tripId, prompt, targetMode: 'trip' });
  }

  getAllForTripShared(tripId: string, prompt: string): Observable<AiItemDto[]> {
    return this.runItemsAsync({ tripId, prompt, targetMode: 'trip-shared' });
  }

  getAllForDic(prompt: string): Observable<AiItemDto[]> {
    return this.runItemsAsync({ prompt, targetMode: 'dic' });
  }

  private runItemsAsync(request: { prompt: string; tripId?: string; targetMode: string }): Observable<AiItemDto[]> {
    const startUrl = `${this.apiUrl}/items/start`;
    const statusUrl = `${this.apiUrl}/items/status`;
    const startTime = Date.now();

    this.loadingService.start();

    return this.http.post<AiAsyncStartResponseDto>(startUrl, request).pipe(
      switchMap(() => timer(0, this.pollIntervalMs).pipe(
        switchMap(() => this.http.post<AiItemsAsyncStatusResponseDto>(statusUrl, request)),
        map(status => {
          if (status.status === 'failed') {
            throw new Error(status.errorMessage || 'AI request failed');
          }

          if (Date.now() - startTime > this.pollTimeoutMs) {
            throw new Error('AI response timeout exceeded');
          }

          return status;
        }),
        takeWhile(status => status.status !== 'completed', true),
        map(status => status.items || [])
      )),
      catchError(error => throwError(() => error)),
      finalize(() => this.loadingService.stop())
    );
  }

}
