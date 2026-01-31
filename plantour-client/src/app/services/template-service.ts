import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { Observable } from 'rxjs';


// TODO: implement an idea to click on an item and buy it on Amazon
export interface VTemplateThingsFullDto {
  id: string;
  name: string;
  category?: string | null;
  units?: string | null;
  value?: number | null;
  thingNotes?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  activityName?: string | null;
  temperatureRangeName?: string | null;
  fromTemp?: number | null;
  toTemp?: number | null;
  ageRangeName?: string | null;
  fromAge?: number | null;
  toAge?: number | null;
  isTargeted?: boolean;
}

export interface AIItemDto {
  category: string;
  item_name: string;
  unit: string;
  value: number;
  recommendations: string;
}

export interface AIPrompt {
  prompt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {

    this.apiUrl = `${environment.apiUrl}/api/template`;
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

  getAllFromAI(prompt: string): Observable<AIItemDto[]> {
    const request = { prompt };
    return this.http.post<AIItemDto[]>(`${this.apiUrl}/ai-items`, request);
  }

}
