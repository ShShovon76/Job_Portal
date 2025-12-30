import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Resume } from 'src/app/models/job-application.model';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor(private api: ApiService) {}

  getResumes(userId: number) {
    return this.api.get<Resume[]>(`/resumes`);
  }

  uploadResume(userId: number, file: File, title?: string) {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);

    return this.api.post<Resume>(`/resumes`, form);
  }

  deleteResume(userId: number, resumeId: number) {
    return this.api.delete(`/resumes/${resumeId}`);
  }

  setPrimary(userId: number, resumeId: number) {
    return this.api.put(`/resumes/${resumeId}/primary`, {});
  }
  
  downloadResume(resumeId: number) {
  return this.api.getBlob(`/resumes/${resumeId}/download`);
}


}