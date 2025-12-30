import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {JobApplication } from 'src/app/models/job-application.model';
import { Pagination } from 'src/app/models/pagination.model';
import { map, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  constructor(
    private api: ApiService,
    private authService: AuthService // Inject AuthService to get current user
  ) {}

 getApplicationsByJob(jobId: number, page = 0, size = 10) {
  return this.api
    .get<any>(`/applications/job/${jobId}`, this.api.buildParams({ page, size }))
    .pipe(
      map((springPage) => ({
        items: springPage.content || [],
        totalItems: springPage.totalElements || 0,
        page: springPage.number || 0,
        size: springPage.size || 0,
        totalPages: springPage.totalPages || 0
      }))
    );
}


  getApplicationsByJobSeeker(jobSeekerId: number, page = 0, size = 10) {
  return this.api
    .get<any>(`/applications/job-seeker/${jobSeekerId}`, this.api.buildParams({ page, size }))
    .pipe(
      map((springPage) => ({
        items: springPage.content || [],
        totalItems: springPage.totalElements || 0,
        page: springPage.number || 0,
        size: springPage.size || 0,
        totalPages: springPage.totalPages || 0
      }))
    );
}


  getApplicationsByEmployer(employerId: number, page = 0, size = 10) {
    return this.api.get<Pagination<JobApplication>>(
      `/applications/employer/${employerId}`,
      this.api.buildParams({ page, size })
    );
  }

  getApplicationById(id: number) {
    return this.api.get<JobApplication>(`/applications/${id}`);
  }

 apply(jobId: number, resumeId: number, coverLetter?: string) {
  return this.api.post<JobApplication>(
    `/applications/apply/${jobId}`,
    {
      resumeId,
      coverLetter
    }
  );
}

  hasApplied(jobId: number) {
  return this.api.get<boolean>(`/applications/jobs/${jobId}/applied`);
}


  updateApplicationStatus(applicationId: number, status: string) {
    // Get current user for changedByUserId
    const currentUser = this.authService.getCurrentUserSnapshot();
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const request = {
      status: status
    };
    
    return this.api.put<JobApplication>(
      `/applications/${applicationId}/status`,
      request,
      this.api.buildParams({ changedByUserId: currentUser.id })
    );
  }

  countApplicationsByJob(jobId: number) {
    return this.api.get<number>(`/applications/job/${jobId}/count`);
  }

  getRecentApplicationsForEmployer(page = 0, size = 10) {
    return this.api.get<Pagination<JobApplication>>(
      `/applications/employer/recent`,
      this.api.buildParams({ page, size })
    );
  }

  getApplicationStatusHistory(applicationId: number) {
    return this.api.get<any[]>(`/applications/${applicationId}/history`);
  }

  withdrawApplication(applicationId: number) {
    return this.api.delete<void>(`/applications/${applicationId}`);
  }
}

