import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TourDto {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /** Get tour JSON from server */
  getTour(id: string): Observable<TourDto> {
    return this.http.get<TourDto>(`${this.apiUrl}/api/tours/${id}`);
  }
}
