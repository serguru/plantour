import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class TemplatesAiService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
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
    const request = { prompt };
    return this.http.post<AiItemDto[]>(`${this.apiUrl}/items-by-prompt`, request);
  }

  getAllForTrip(tripId: string, prompt: string): Observable<AiItemDto[]> {
    const request = { tripId, prompt };
    return this.http.post<AiItemDto[]>(`${this.apiUrl}/trip/prompt`, request);
  }

  getAllForTripShared(tripId: string, prompt: string): Observable<AiItemDto[]> {
    const request = { tripId, prompt };
    return this.http.post<AiItemDto[]>(`${this.apiUrl}/trip-shared/prompt`, request);
  }

  getAllForDic(prompt: string): Observable<AiItemDto[]> {
    const request = { prompt };
    return this.http.post<AiItemDto[]>(`${this.apiUrl}/dic/prompt`, request);
  }

}
