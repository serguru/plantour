import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

@Injectable({
  providedIn: 'root',
})
export class DropboxService {
  private readonly apiUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(ENVIRONMENT) environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.api.baseUrl}/Dropbox`;
  }

  getImage(url: string): Observable<Blob> {
    const params = new HttpParams().set('url', url);
    return this.http.get(`${this.apiUrl}/image`, {
      params,
      responseType: 'blob',
    });
  }
}