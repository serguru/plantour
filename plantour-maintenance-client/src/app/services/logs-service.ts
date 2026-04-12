import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../environment.token';
import { LogRowDto } from '../models/log.models';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(ENVIRONMENT);

  getRows(fromUtcIso: string, toUtcIso: string): Observable<LogRowDto[]> {
    const params = new HttpParams()
      .set('from', fromUtcIso)
      .set('to', toUtcIso);

    return this.http.get<LogRowDto[]>(`${this.environment.api.baseUrl}/logs`, { params });
  }
}