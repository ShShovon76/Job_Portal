import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        // Handle 404
        if (error.status === 404) {
          this.router.navigate(['/404']);
        }

        // Handle 403
        if (error.status === 403) {
          this.router.navigate(['/403']);
        }

        // Handle 500
        if (error.status === 500) {
          console.error("Server Error:", error);
        }

        return throwError(() => error);
      })
    );
  }
}
