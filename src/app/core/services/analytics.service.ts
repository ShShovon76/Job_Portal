import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ApplicationTrendsResponse, EmployerDashboardResponse, JobSeekerDashboardResponse, JobViewsResponse, SiteMetricsResponse } from 'src/app/models/analytics.models';

@Injectable({
  providedIn: 'root'
})
@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  constructor(private api: ApiService) {}

  /* ============================
     Job Views Analytics
     ============================ */
  getJobViews(
    jobId: number,
    from?: string,
    to?: string
  ): Observable<JobViewsResponse> {
    const params = this.api.buildParams({ from, to });
    return this.api.get<JobViewsResponse>(
      `/analytics/jobs/${jobId}/views`,
      params
    );
  }

  /* ============================
     Application Trends
     ============================ */
  getApplicationTrends(
    jobId?: number,
    employerId?: number,
    from?: string,
    to?: string
  ): Observable<ApplicationTrendsResponse> {
    const params = this.api.buildParams({
      jobId,
      employerId,
      from,
      to
    });

    return this.api.get<ApplicationTrendsResponse>(
      '/analytics/applications/trends',
      params
    );
  }

  /* ============================
     Employer Dashboard
     ============================ */
  getEmployerDashboard(
    employerId: number
  ): Observable<EmployerDashboardResponse> {
    return this.api.get<EmployerDashboardResponse>(
      `/analytics/employers/${employerId}/dashboard`
    );
  }

  /* ============================
     Admin Site Metrics
     ============================ */
  getSiteMetrics(): Observable<SiteMetricsResponse> {
    return this.api.get<SiteMetricsResponse>(
      '/analytics/site-metrics'
    );
  }
getJobSeekerDashboard(
  jobSeekerId: number
): Observable<JobSeekerDashboardResponse> {
  return this.api.get<JobSeekerDashboardResponse>(
    `/analytics/job-seekers/${jobSeekerId}/dashboard`
  );
}


}
