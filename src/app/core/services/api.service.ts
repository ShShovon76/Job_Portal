import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private formatErrors(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  get<T>(path: string, params?: HttpParams): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    return this.http.get<T>(url, { params }).pipe(catchError(this.formatErrors));
  }

  post<T>(path: string, body: any, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    return this.http.post<T>(url, body, { params, headers }).pipe(catchError(this.formatErrors));
  }

  put<T>(path: string, body: any, params?: HttpParams): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    return this.http.put<T>(url, body, { params }).pipe(catchError(this.formatErrors));
  }

  patch<T>(path: string, body: any, params?: HttpParams): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    return this.http.patch<T>(url, body, { params }).pipe(catchError(this.formatErrors));
  }

  delete<T>(path: string, params?: HttpParams): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    return this.http.delete<T>(url, { params }).pipe(catchError(this.formatErrors));
  }

  // helper to build HttpParams from an object
  buildParams(paramsObj?: Record<string, any>): HttpParams {
  let params = new HttpParams();
  
  if (!paramsObj) return params;
  
  Object.keys(paramsObj).forEach(key => {
    const val = paramsObj[key];
    
    if (val === null || val === undefined || val === '') return;
    
    // Handle Date objects
    if (val instanceof Date) {
      params = params.set(key, val.toISOString());
    }
    // Handle arrays
    else if (Array.isArray(val)) {
      val.forEach(v => {
        if (v !== null && v !== undefined && v !== '') {
          params = params.append(key, String(v));
        }
      });
    }
    // Handle objects (convert to JSON string)
    else if (typeof val === 'object' && !(val instanceof Date)) {
      params = params.set(key, JSON.stringify(val));
    }
    // Handle primitive values
    else {
      params = params.set(key, String(val));
    }
  });
  
  return params;
}
 getBlob(url: string) {
    return this.http.get(this.baseUrl + url, {
      responseType: 'blob'
    });
  }
}