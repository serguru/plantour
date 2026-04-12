import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../environment.token';
import { VisitorActivityRowDto } from '../models/visitor-activity.models';

@Injectable({
  providedIn: 'root'
})
export class VisitorActivityService {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(ENVIRONMENT);

  getRows(fromUtcIso: string, toUtcIso: string): Observable<VisitorActivityRowDto[]> {
    const params = new HttpParams()
      .set('from', fromUtcIso)
      .set('to', toUtcIso);

    return this.http.get<VisitorActivityRowDto[]>(`${this.environment.api.baseUrl}/visitor-activity`, { params });
  }
}