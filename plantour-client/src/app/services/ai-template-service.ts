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
    return this.http.get<AiPromptDto[]>(`${this.apiUrl}/ai-items`, request);
  }
  
  // Returns AI generated items based on the provided prompt
  getAll(prompt: string): Observable<AiItemDto[]> {
    const request = { prompt };
    return this.http.post<AiItemDto[]>(`${this.apiUrl}/ai-items`, request);
  }

  getAll(): Observable<VTemplateThingsFullDto[]> {
    return this.http.get<VTemplateThingsFullDto[]>(this.apiUrl);
  }

  getAllForTrip(tripId: string): Observable<VTemplateThingsFullDto[]> {
    return this.http.get<VTemplateThingsFullDto[]>(`${this.apiUrl}/trip/${tripId}`);
  }

  getAllForSharedTrip(tripId: string): Observable<VTemplateThingsFullDto[]> {
    return this.http.get<VTemplateThingsFullDto[]>(`${this.apiUrl}/trip-shared/${tripId}`);
  }

  getAllForDic(): Observable<VTemplateThingsFullDto[]> {
    return this.http.get<VTemplateThingsFullDto[]>(`${this.apiUrl}/dic`);
  }




}
