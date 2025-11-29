export interface AccessToken {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  expires: string;
  issuer: string;
  audience: string;
  role: string;
  accessCode?: string;
  adminId?: string;
  exp: number;
}


// Request models
export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpParticipantRequest {
  adminId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
}

export interface SignInParticipantRequest {
  accessCode: string;
  password?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Response models
export interface AuthResponse {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
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
  refreshToken: string;
  expiresAt: string;
  role: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
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
