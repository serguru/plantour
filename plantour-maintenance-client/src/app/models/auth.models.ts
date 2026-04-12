import { UserDto } from './user.models';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AccessTokenPayload {
  aud?: string | string[];
  email?: string;
  exp: number;
  iat?: number;
  iss?: string;
  jti?: string;
  name?: string;
  nameid?: string;
  sub?: string;
  unique_name?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: UserDto;
}

export interface ApiErrorResponse {
  statusCode?: number;
  code?: string;
  message?: string;
}
