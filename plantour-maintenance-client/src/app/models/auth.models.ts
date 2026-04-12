import { UserDto } from './user.models';

export interface SignInRequest {
  email: string;
  password: string;
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

export interface StoredSession {
  accessToken: string;
  expiresAtUtc: string;
  user: UserDto;
}
