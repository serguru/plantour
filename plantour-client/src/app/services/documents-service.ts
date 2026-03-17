import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {

  private apiUrl: string;

  constructor(private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/documents`;
  }

  getTripReportPdf(tripId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trip/${tripId}`, {
      responseType: 'blob'
    });
  }

  getPackingListPdf(tripId: string, tripPackId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trip/${tripId}/package/${tripPackId}/packing-list`, {
      responseType: 'blob'
    });
  }
}
