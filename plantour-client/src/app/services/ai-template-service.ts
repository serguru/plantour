import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { Observable } from 'rxjs';


// TODO: implement an idea to click on an item and buy it on Amazon

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

export interface AIPrompt {
  prompt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiTemplateService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.apiUrl}/api/aitemplate`;
  }


  getLatestPrompts(): Observable<AiPromptDto[]> {
    return this.http.get<AiPromptDto[]>(`${this.apiUrl}/latest-prompts`);
  }
  
  // Returns AI generated items based on the provided prompt
  getAllByPrompt(prompt: string): Observable<AiItemDto[]> {
    const request = { prompt };
    return this.http.post<AiItemDto[]>(`${this.apiUrl}/items-by-prompt`, request);
  }

  getAllByPromptId(promptId: string): Observable<AiItemDto[]> {
    return this.http.get<AiItemDto[]>(`${this.apiUrl}/items-by-prompt-id/${promptId}`);
  }

  getAllForTrip(tripId: string, promptId: string): Observable<AiItemDto[]> {
    return this.http.get<AiItemDto[]>(`${this.apiUrl}/trip/${tripId}/prompt/${promptId}`);
  }

  getAllForSharedTrip(tripId: string, promptId: string): Observable<AiItemDto[]> {
    return this.http.get<AiItemDto[]>(`${this.apiUrl}/trip-shared/${tripId}/prompt/${promptId}`);
  }

  getAllForDic(promptId: string): Observable<AiItemDto[]> {
    return this.http.get<AiItemDto[]>(`${this.apiUrl}/dic/prompt/${promptId}`);
  }




}
