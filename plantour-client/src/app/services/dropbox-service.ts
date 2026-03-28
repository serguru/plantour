import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export interface DropboxBrowseEntryDto {
  type: 'folder' | 'file';
  name: string;
  pathDisplay?: string | null;
  id?: string | null;
  source?: string | null;
}

export interface DropboxBrowseResultDto {
  currentPath?: string | null;
  parentPath?: string | null;
  entries: DropboxBrowseEntryDto[];
}

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

  browse(path: string | null): Observable<DropboxBrowseResultDto> {
    let params = new HttpParams();
    if (path) {
      params = params.set('path', path);
    }

    return this.http.get<DropboxBrowseResultDto>(`${this.apiUrl}/browse`, { params });
  }

  getImage(source: string): Observable<Blob> {
    const params = new HttpParams().set('source', source);
    return this.http.get(`${this.apiUrl}/image`, {
      params,
      responseType: 'blob',
    });
  }
}