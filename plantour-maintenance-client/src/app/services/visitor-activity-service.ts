import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../environment.token';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';
import { VisitorActivityRowDto } from '../models/visitor-activity.models';

@Injectable({
  providedIn: 'root'
})
export class VisitorActivityService {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(ENVIRONMENT);

  getRows(period?: VisitorActivityPeriod | null): Observable<VisitorActivityRowDto[]> {
    let params = new HttpParams();

    if (period) {
      params = params
        .set('from', period.fromUtcIso)
        .set('to', period.toUtcIso);
    }

    return this.http.get<VisitorActivityRowDto[]>(`${this.environment.api.baseUrl}/visitor-activity`, { params });
  }
}