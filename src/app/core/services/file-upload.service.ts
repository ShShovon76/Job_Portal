import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private api: ApiService) {}

  uploadResume(file: File, meta: Record<string, any> = {}): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    Object.keys(meta || {}).forEach(k => form.append(k, meta[k]));
    const headers = new HttpHeaders({ /* if needed, custom headers */ });
    return this.api.post<{ url: string }>('/uploads/resume', form, undefined, headers);
  }

  uploadCompanyLogo(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.api.post<{ url: string }>('/uploads/company-logo', form);
  }

  uploadProfilePicture(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.api.post<{ url: string }>('/uploads/profile-picture', form);
  }

  // generic file download helper (returns blob)
  download(path: string) {
    return this.api.get<Blob>(path);
  }
}
