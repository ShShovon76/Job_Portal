import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CreateJobPayload, Job, UpdateJobPayload } from 'src/app/models/job.model';
import { Pagination } from 'src/app/models/pagination.model';
import { map, Observable } from 'rxjs';
import { JobSearchFilter } from 'src/app/models/job-search-filter.model';
import { JobAnalytics } from 'src/app/models/analytics.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private readonly api = environment.apiUrl + '/jobs';

  constructor(private http: HttpClient) {}

  // -------------------------
  // PUBLIC JOB LIST (JobListComponent, Similar Jobs)
  // -------------------------
  list(filter: JobSearchFilter): Observable<Pagination<Job>> {
  return this.http.post<any>(`${this.api}/search`, filter).pipe(
    map((springPage: any) => ({
      items: springPage.content || [],
      totalItems: springPage.totalElements || 0,
      page: springPage.number || 0,
      size: springPage.size || 0,
      totalPages: springPage.totalPages || 0
    }))
  );
}

  // -------------------------
  // EMPLOYER JOB LIST (ManageJobsComponent, Dashboard)
  // -------------------------
 listByEmployer(
  employerId: number,
  filter: {
    page: number;
    size: number;
    status?: string;
    jobType?: string;
    keyword?: string;
  }
): Observable<Pagination<Job>> {
  
  let params = new HttpParams()
    .set('page', filter.page)
    .set('size', filter.size);

  if (filter.status) {
    params = params.set('status', filter.status);
  }

  if (filter.jobType) {
    params = params.set('jobType', filter.jobType);
  }

  if (filter.keyword) {
    params = params.set('keyword', filter.keyword);
  }

  return this.http.get<any>(`${this.api}/employer/${employerId}`, { params }).pipe(
    // ✅ Map Spring Page to your Pagination format
    map((springPage: any) => ({
      items: springPage.content || [],
      totalItems: springPage.totalElements || 0,
      page: springPage.number || 0,
      size: springPage.size || 0,
      totalPages: springPage.totalPages || 0
    }))
  );
}

   listByCompany(
  companyId: number,
  filter: {
    page?: number;
    size?: number;
    jobType?: string;
    status?: string;
  } = {}
): Observable<Pagination<Job>> {
  
  let params = new HttpParams();
  
  if (filter.page !== undefined) {
    params = params.set('page', filter.page.toString());
  }
  
  if (filter.size !== undefined) {
    params = params.set('size', filter.size.toString());
  }
  
  if (filter.jobType) {
    params = params.set('jobType', filter.jobType);
  }
  
  if (filter.status) {
    params = params.set('status', filter.status);
  }
  
  return this.http.get<any>(`${this.api}/company/${companyId}`, { params }).pipe(
    map((springPage: any) => ({
      items: springPage.content || [],
      totalItems: springPage.totalElements || 0,
      page: springPage.number || 0,
      size: springPage.size || 0,
      totalPages: springPage.totalPages || 0
    }))
  );
}

  // -------------------------
  // SINGLE JOB
  // -------------------------
  get(jobId: number): Observable<Job> {
    return this.http.get<Job>(`${this.api}/${jobId}`);
  }

  // -------------------------
  // CREATE JOB
  // -------------------------
  create(employerId: number, payload: CreateJobPayload): Observable<Job> {
  // Send employerId as a query parameter
  const params = new HttpParams().set('employerId', employerId.toString());
  return this.http.post<Job>(this.api, payload, { params }); // POST to /api/jobs
}

  // -------------------------
  // UPDATE JOB
  // -------------------------
 update(jobId: number, employerId: number, payload: Partial<Job>): Observable<Job> {
  // Send employerId as a query parameter
  const params = new HttpParams().set('employerId', employerId.toString());
  return this.http.put<Job>(`${this.api}/${jobId}`, payload, { params }); // PUT to /api/jobs/{id}
}

  // -------------------------
  // DELETE JOB
  // -------------------------
 delete(jobId: number, employerId: number): Observable<void> {
  // Send employerId as a query parameter
  const params = new HttpParams().set('employerId', employerId.toString());
  return this.http.delete<void>(`${this.api}/${jobId}`, { params }); // DELETE to /api/jobs/{id}
}

  // -------------------------
  // JOB ANALYTICS (Views, Tracking)
  // -------------------------
  recordView(
    jobId: number,
    viewerId?: number,
    ipAddress?: string,
    userAgent?: string
  ): Observable<void> {
    return this.http.post<void>(`${this.api}/${jobId}/view`, {
      viewerId,
      ipAddress,
      userAgent
    });
  }

  getJobAnalytics(jobId: number): Observable<JobAnalytics> {
    return this.http.get<JobAnalytics>(`${this.api}/${jobId}/analytics`);
  }
}