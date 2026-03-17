import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface PublicTemplateThingDto {
  thingId: string;
  thingName: string;
  category?: string | null;
  units?: string | null;
  value?: number | null;
  thingNotes?: string | null;
  templateId: string;
  templateName: string;
  activityName: string;
  temperatureRangeName?: string | null;
  fromTemp?: number | null;
  toTemp?: number | null;
  ageRangeName?: string | null;
  fromAge?: number | null;
  toAge?: number | null;
}

export interface PublicAgeRangeDto {
  id: string;
  name: string;
  fromAge: number;
  toAge?: number | null;
  notes?: string | null;
}

export interface PublicTemperatureRangeDto {
  id: string;
  name: string;
  fromTemp?: number | null;
  toTemp?: number | null;
  notes?: string | null;
}

export interface PublicActivityDto {
  id: string;
  name: string;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PublicTemplatesService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/public`;
  }

  getTemplateThings(): Observable<PublicTemplateThingDto[]> {
    return this.http.get<PublicTemplateThingDto[]>(`${this.apiUrl}/templates`);
  }

  getTemplateThingsByTemplateId(templateId: string): Observable<PublicTemplateThingDto[]> {
    return this.http.get<PublicTemplateThingDto[]>(`${this.apiUrl}/templates/${templateId}`);
  }

  getAgeRanges(): Observable<PublicAgeRangeDto[]> {
    return this.http.get<PublicAgeRangeDto[]>(`${this.apiUrl}/age-ranges`);
  }

  getTemperatureRanges(): Observable<PublicTemperatureRangeDto[]> {
    return this.http.get<PublicTemperatureRangeDto[]>(`${this.apiUrl}/temperature-ranges`);
  }

  getActivities(): Observable<PublicActivityDto[]> {
    return this.http.get<PublicActivityDto[]>(`${this.apiUrl}/activities`);
  }
}
