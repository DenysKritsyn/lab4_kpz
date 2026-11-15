export type Role = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: Role[];
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

