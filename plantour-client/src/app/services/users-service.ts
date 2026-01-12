import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AccessToken, SignUpParticipantRequest, SignUpRequest } from '../models/auth.models';
import { ENVIRONMENT, EnvironmentConfig } from '../../environment.token';
import { AppService } from './app-service';
import { LocalStorageService } from './local-storage-service';
import { toSignal } from '@angular/core/rxjs-interop';


export interface UserDto {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: number | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl: string;
  appService = inject(AppService);
  localStorageService = inject(LocalStorageService);

  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private environment: EnvironmentConfig
  ) {
    this.apiUrl = environment.apiUrl;
  }

  private getUserFromLocalStorage(): AccessToken | null {
    const token = this.localStorageService.getItem("accessToken");
    if (!token) {
      return null;
    }
    return jwtDecode<AccessToken>(token);
  }

  private writeTokenToStorage(token: string | null): void {
    if (token) {
      this.localStorageService.setItem("accessToken", token);
      return;
    }
    this.localStorageService.setItem("accessToken", null);
  }


  private userSubject: BehaviorSubject<AccessToken | null> = new BehaviorSubject<AccessToken | null>(this.getUserFromLocalStorage());
  user$: Observable<AccessToken | null> = this.userSubject.asObservable();
  updateUser(token: string | null): void {
    let user: any = null;
    if (token) {
      user = jwtDecode<AccessToken>(token);
    }
    this.writeTokenToStorage(token);
    this.userSubject.next(user);
  }

  userSignal = toSignal(this.user$, { requireSync: true });

  // currentUser(): AccessToken | null {
  //   return this.currentUserSubject.getValue();
  // }

  userText$ = this.user$.pipe(
    map(user => {
      if (!user) {
        return "Profile";
      } 
      let result = "";
      if (user.last_name && user.first_name) {
        result += `${user.first_name} ${user.last_name}`;
      } else {
        result += user.email
      } 
      // if (user.role === 'Participant') {
      //   result += ", participant";
      // } 
      return result;
    })
  );

  userTextSignal = toSignal(this.userText$, { requireSync: true });


  // getCurrentUserText(): string {
  //   const user = this.currentUser();
  //   if (!user) {
  //     return "Profile";
  //   }

  //   let result = "";
  //   if (user.last_name && user.first_name) {
  //     result += `${user.first_name} ${user.last_name}`;
  //   } else {
  //     result += user.email
  //   }

  //   if (user.role === 'Participant') {
  //     result += ", participant";
  //   }

  //   return result;
  // }


  isAuthenticatedSignal = toSignal(this.user$.pipe(
    map(user => {
      if (!user || user.exp <= Math.floor(Date.now() / 1000) || ['Admin', 'Participant'].indexOf(user.role) === -1) {
        return false;
      }
      return true;
    }
    )
  ), { requireSync: true });


  // get isAuthenticated(): boolean {
  //   const user = this.currentUser();
  //   if (!user || user.exp <= Math.floor(Date.now() / 1000)) {
  //     // this.resetState();
  //     // this.appService.resetState();
  //     return false;
  //   }
  //   return true;
  // }

  loginAdmin(email: string, password: string): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/admin/signin`, { email, password })
      .pipe(
        tap((r: any) => {
          this.updateUser(r.accessToken);
        }
        ))
  }


  loginParticipant(accessCode: string): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/participant/signin`, { accessCode })
      .pipe(
        tap((r: any) => {
          this.updateUser(r.accessToken);
        }
        ))
  }

  registerAdmin(data: SignUpRequest): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/admin/signup`, data)
      .pipe(
        tap((r: any) => {
          this.updateUser(r.accessToken);
        })
      )
  }

  registerParticipant(data: SignUpParticipantRequest): Observable<any> {
    return this.http.post<string>(`${this.apiUrl}/api/users/participant/signup`, data)
  }

  isAdminSignal = toSignal(this.user$.pipe(
    map(user => {
      if (user?.role === 'Admin' && this.isAuthenticatedSignal()) {
        return true;
      }
      return false;
    }
    )
  ), { requireSync: true });

  // get isAdmin(): boolean {
  //   const user = this.currentUser();
  //   return user?.role === 'Admin' && this.isAuthenticated;
  // }

  isParticipantSignal = toSignal(this.user$.pipe(
    map(user => {
      if (user?.role === 'Participant' && this.isAuthenticatedSignal()) {
        return true;
      }
      return false;
    }
    )
  ), { requireSync: true });

  //


  // get isParticipant(): boolean {
  //   const user = this.currentUser();
  //   return user?.role === 'Participant' && this.isAuthenticated;
  // }


  signOut(): void {
    this.updateUser(null);
    this.localStorageService.setItem("accessToken", null);
  }
}