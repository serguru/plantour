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
    this.apiUrl = `${environment.apiUrl}/api/documents`;
  }


  getTestPdf(): Observable<Blob> {
    return this.http.get('http://localhost:5217/api/Documents/test-pdf', {
      responseType: 'blob'
    });
  }

  getTripReportPdf(tripId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/trip/${tripId}`, {
      responseType: 'blob'
    });
  }
}
