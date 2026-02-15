import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';

export class PortalSessionResponseDto
{
    public url!: string;
}


@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = `${environment.apiUrl}/api/stripe`;
  }

  getCustomerPortalUrl(): Observable<PortalSessionResponseDto> {
    return this.http.get<PortalSessionResponseDto>(`${this.apiUrl}/create-portal-session`);
  }
  
}
