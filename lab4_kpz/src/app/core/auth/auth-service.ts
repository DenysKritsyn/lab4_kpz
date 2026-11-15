import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, TokenResponse, User } from './auth.model';

const TOKEN_STORAGE_KEY = 'symptom_diary_access_token';
const USER_STORAGE_KEY = 'symptom_diary_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenState = signal<string | null>(this.loadStoredToken());
  private readonly userState = signal<User | null>(this.loadStoredUser());

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null && this.token() !== null);

  hasRole(...roles: Role[]): boolean {
    const userRoles = this.user()?.roles ?? [];
    return roles.some(role => userRoles.includes(role));
  }

  loginWithPassword(username: string, password: string): Observable<TokenResponse> {
    const body = new HttpParams()
      .set('client_id', environment.keycloakClientId)
      .set('grant_type', 'password')
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<TokenResponse>(environment.keycloakTokenUrl, body.toString(), { headers }).pipe(
      tap(response => {
        const parsedUser = this.parseJwtUser(response.access_token, username);
        this.setSession(response.access_token, parsedUser);
      })
    );
  }

  loginDemo(user: User, demoToken = 'demo-jwt-token'): void {
    this.setSession(demoToken, user);
  }

  logout(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  private setSession(token: string, user: User): void {
    this.tokenState.set(token);
    this.userState.set(user);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  private parseJwtUser(accessToken: string, fallbackUsername: string): User {
    try {
      const payloadBase64 = accessToken.split('.')[1];
      const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedJson = decodeURIComponent(
        atob(normalized)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(decodedJson);

      const rawRoles: string[] =
        payload.roles ??
        payload.realm_access?.roles ??
        [];

      const validRoles = rawRoles.filter(
        (r): r is Role => r === 'patient' || r === 'doctor' || r === 'admin'
      );

      return {
        id: payload.sub ?? fallbackUsername,
        username: payload.preferred_username ?? fallbackUsername,
        name: payload.name ?? payload.preferred_username ?? fallbackUsername,
        email: payload.email ?? `${fallbackUsername}@example.com`,
        roles: validRoles.length > 0 ? validRoles : ['patient']
      };
    } catch {
      return {
        id: fallbackUsername,
        username: fallbackUsername,
        name: fallbackUsername,
        email: `${fallbackUsername}@example.com`,
        roles: ['patient']
      };
    }
  }

  private loadStoredToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private loadStoredUser(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}

