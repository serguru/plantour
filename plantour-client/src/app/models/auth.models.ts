export interface AccessRule {
  id: number;
  name: string;
  notes?: string | null;
  granted: boolean;
  value?: number | null;
}

export interface AccessToken {
  exp: number;
  role?: string;
  admin_id?: string;
  adminId?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
  access_rules?: AccessRule[] | null;
}


// Request models
export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
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
  password?: string;
}


// Response models
export interface ApiErrorResponse {
  statusCode: number;
  code?: string;
  message: string;
  instance?: string;
}

export interface AuthResponse extends ApiErrorResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  emailConfirmationRequired: boolean;
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
