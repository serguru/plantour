import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../environment.token';
import { PlantourUserRowDto } from '../models/plantour-user.models';
import { VisitorActivityPeriod } from '../models/visitor-activity-period.models';

@Injectable({
  providedIn: 'root'
})
export class PlantourUsersService {
  private readonly http = inject(HttpClient);
  private readonly environment = inject(ENVIRONMENT);

  getRows(period?: VisitorActivityPeriod | null): Observable<PlantourUserRowDto[]> {
    let params = new HttpParams();

    if (period) {
      params = params
        .set('from', period.fromUtcIso)
        .set('to', period.toUtcIso);
    }

    return this.http.get<PlantourUserRowDto[]>(`${this.environment.api.baseUrl}/users/plantour`, { params });
  }
}