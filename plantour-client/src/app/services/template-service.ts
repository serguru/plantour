import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { Observable } from 'rxjs';

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

  getAllForDic(tripId: string): Observable<VTemplateThingsFullDto[]> {
    return this.http.get<VTemplateThingsFullDto[]>(`${this.apiUrl}/dic/${tripId}`);
  }
}
