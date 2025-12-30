import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest } from 'src/app/models/login-request.model';
import { LoginResponse } from 'src/app/models/login-response.model';
import { User } from 'src/app/models/user.model';
import { RegisterJobSeekerRequest } from 'src/app/models/register-jobseeker-request.model';
import { RegisterEmployerRequest } from 'src/app/models/register-employer-request.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser$ = new BehaviorSubject<User | null>(
    this.loadUserFromStorage()
  );

  constructor(private api: ApiService) {}

  // -------------------------
  // USER STATE
  // -------------------------

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) as User : null;
  }

  private saveUserToStorage(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    this.currentUser$.next(user);
  }

  /** Observable for components, guards, navbar, etc */
  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /** Snapshot for sync use (interceptors, services) */
  getCurrentUserSnapshot(): User | null {
    return this.currentUser$.getValue();
  }

  // -------------------------
  // AUTH
  // -------------------------

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', payload).pipe(
      tap(res => {
        if (res?.accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
        }

        if (res?.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        }

        if (res?.user) {
          this.saveUserToStorage(res.user);
        }
      })
    );
  }

  registerJobSeeker(payload: RegisterJobSeekerRequest) {
    return this.api.post<LoginResponse>('/auth/register/job-seeker', payload);
  }

  registerEmployer(payload: RegisterEmployerRequest) {
    return this.api.post<LoginResponse>('/auth/register/employer', payload);
  }

  // -------------------------
  // TOKEN
  // -------------------------

  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.forceLogout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.api.post<{ accessToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    ).pipe(
      tap(res => {
        if (res?.accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
        }
      }),
      catchError(error => {
        this.forceLogout();
        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // -------------------------
  // LOGOUT
  // -------------------------

  /**
   * Use this from components (observable)
   */
  logout(): Observable<boolean> {
    this.clearLocalSession();

    // optional backend logout
    return this.api.post<void>('/auth/logout', {}).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  /**
   * Use this internally (interceptors)
   */
  forceLogout(): void {
    this.clearLocalSession();
  }

  private clearLocalSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.saveUserToStorage(null);
  }

  // -------------------------
  // PROFILE
  // -------------------------

  updateProfile(userId: number, payload: Partial<User>): Observable<User> {
    return this.api.put<User>(`/users/${userId}`, payload).pipe(
      tap(user => {
        if (user && user.id === this.getCurrentUserSnapshot()?.id) {
          this.saveUserToStorage(user);
        }
      })
    );
  }

  // -------------------------
  // UTIL
  // -------------------------

  saveAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  removeTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
