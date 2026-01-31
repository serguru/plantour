import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { Observable } from 'rxjs';


// TODO: implement an idea to click on an item and buy it on Amazon

export interface AIItemDto {
  category: string;
  name: string;
  units: string;
  value: number;
  notes: string;
  isTargeted?: boolean;
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
  
  // Returns AI generated items based on the provided prompt
  getAll(prompt: string): Observable<AIItemDto[]> {
    const request = { prompt };
    return this.http.post<AIItemDto[]>(`${this.apiUrl}/ai-items`, request);
  }

}
