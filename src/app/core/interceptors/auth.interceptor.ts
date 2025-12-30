import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
const PUBLIC_API_URLS = [
  '/auth/',
  '/companies',
  '/jobs',
  '/categories',
  '/reviews',
  '/jobs'
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // ✅ Public APIs → no token
    if (this.isPublicApi(req.url)) {
      return next.handle(req);
    }

    const token = this.auth.getAccessToken();

    const authReq = token
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        })
      : req;

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicApi(url: string): boolean {
  return (
    url.includes('/api/auth/') ||
    url.includes('/api/public/')
  );
}

  private handle401(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.auth.getAccessToken()) {
      return throwError(() => new Error('Unauthenticated'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.auth.refreshToken().pipe(
        switchMap(res => {
          this.isRefreshing = false;

          if (!res?.accessToken) {
            this.forceLogout();
            return throwError(() => new Error('Refresh failed'));
          }

          this.refreshTokenSubject.next(res.accessToken);
          return next.handle(
            request.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            })
          );
        }),
        catchError(() => {
          this.isRefreshing = false;
          this.forceLogout();
          return throwError(() => new Error('Session expired'));
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token =>
        next.handle(
          request.clone({
            setHeaders: { Authorization: `Bearer ${token!}` }
          })
        )
      )
    );
  }

  private forceLogout() {
    this.auth.forceLogout();
    this.router.navigate(['/auth/login']);
  }
}

