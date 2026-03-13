export interface AccessRule {
  id: number;
  name: string;
  notes?: string | null;
  granted: boolean;
  value?: number | null;
}

export interface AccessToken {
  aud: string;
  email: string;
  exp: number;
  first_name?: string;
  last_name?: string;
  iat: number;
  iss: string;
  jti: string;
  user_id?: string;
  admin_id?: string;
  nbf: number;
  access_rules?: AccessRule[] | null;
  role: 'Admin' | 'Participant';
  plan_period: string;
  billing_period_start?: string;
  billing_period_end?: string;
  temporary: string;
}

export interface SignInRequest {
  email: string;
}

export interface SocialSignInRequest {
  provider: 'google' | 'facebook';
  googleIdToken?: string;
  facebookAccessToken?: string;
}

export interface SignUpParticipantRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  notes?: string;
}

export interface SignInParticipantRequest {
  accessCode: string;
}


// Response models
export interface ApiErrorResponse {
  statusCode: number;
  code?: string;
  message: string;
  instance?: string;
}

export interface SignInResponse {
    signInEmailTokenMinutes: number;
    fullUserName: string;
}


export interface AuthResponse extends ApiErrorResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  emailSignInRequired: boolean;
}

export interface ParticipantAuthResponse {
  participantId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accessCode: string;
  adminId: string;
  adminEmail: string;
  adminFirstName?: string;
  adminLastName?: string;
  accessToken: string;
  expiresAt: string;
  role: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
}

// Current user model
export interface CurrentUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role: 'Admin' | 'Participant';
  accessCode?: string;
  adminId?: string;
  adminEmail?: string;
}
