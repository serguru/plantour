import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../environment.token';
import { LogRowDto } from '../models/log.models';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(ENVIRONMENT);

  getRows(period?: VisitorActivityPeriod | null): Observable<LogRowDto[]> {
    let params = new HttpParams();

    if (period) {
      params = params
        .set('from', period.fromUtcIso)
        .set('to', period.toUtcIso);
    }

    return this.http.get<LogRowDto[]>(`${this.environment.api.baseUrl}/logs`, { params });
  }
}