import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../environment.token';
import { SettingRowDto, UpdateSettingRequest } from '../models/setting.models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(ENVIRONMENT);

  getRows(): Observable<SettingRowDto[]> {
    return this.http.get<SettingRowDto[]>(`${this.environment.api.baseUrl}/settings`);
  }

  updateRow(key: string, request: UpdateSettingRequest): Observable<SettingRowDto> {
    return this.http.put<SettingRowDto>(`${this.environment.api.baseUrl}/settings/${encodeURIComponent(key)}`, request);
  }
}