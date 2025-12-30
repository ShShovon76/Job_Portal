import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobSeekerDashboardResponse } from 'src/app/models/analytics.models';
import { Job } from 'src/app/models/job.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, switchMap } from 'rxjs';
import { JobService } from 'src/app/core/services/job.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { JobSearchFilter } from 'src/app/models/job-search-filter.model';
import { ApplicationStatus } from 'src/app/models/job-application.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  dashboardData: JobSeekerDashboardResponse = {
    jobSeekerId: 0,
    fullName: '',
    totalApplications: 0,
    applicationsLast30Days: 0,
    applicationStatusBreakdown: {},
    recentApplications: []
  };

  recommendedJobs: Job[] = [];
  isLoading = true;
  isJobsLoading = false;

  searchForm: FormGroup;
  userId!: number;

  private subscriptions = new Subscription();

  // expose enum to template
  ApplicationStatus = ApplicationStatus;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private jobService: JobService,
    private analyticsService: AnalyticsService,
    private notificationService: NotificationService
  ) {
    this.searchForm = this.fb.group({
      keyword: [''],
      location: [''],
      jobType: [''],
      remote: [false]
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUserSnapshot();
    if (!user) return;

    this.userId = user.id;

    this.loadDashboardData();
    this.loadRecommendedJobs();
    this.setupSearchListener();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ===========================
  // DASHBOARD DATA
  // ===========================
  private loadDashboardData(): void {
  this.subscriptions.add(
    this.analyticsService.getJobSeekerDashboard(this.userId).subscribe({
      next: data => {
        this.dashboardData = {
          ...data,
          recentApplications: data.recentApplications ?? [],
          applicationStatusBreakdown: data.applicationStatusBreakdown ?? {}
        };

        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.notificationService.showError('Failed to load dashboard');
        this.isLoading = false;
      }
    })
  );
}


  // ===========================
  // JOB SEARCH
  // ===========================
  private loadRecommendedJobs(): void {
    this.isJobsLoading = true;

    const filter: JobSearchFilter = {
      page: 0,
      size: 6,
      remote: true
    };

    this.subscriptions.add(
      this.jobService.list(filter).subscribe({
        next: res => {
          this.recommendedJobs = res.items;
          this.isJobsLoading = false;
        },
        error: () => {
          this.isJobsLoading = false;
        }
      })
    );
  }

  private setupSearchListener(): void {
    this.subscriptions.add(
      this.searchForm.valueChanges
        .pipe(
          switchMap(value => {
            const filter: JobSearchFilter = {
              keyword: value.keyword || undefined,
              location: value.location || undefined,
              jobType: value.jobType || undefined,
              remote: value.remote,
              page: 0,
              size: 10
            };
            return this.jobService.list(filter);
          })
        )
        .subscribe({
          next: res => (this.recommendedJobs = res.items),
          error: err => console.error(err)
        })
    );
  }

  // ===========================
  // STATUS HELPERS (FIXED)
  // ===========================

 getStatusCount(status: ApplicationStatus): number {
  if (!this.dashboardData?.applicationStatusBreakdown) return 0;

  return this.dashboardData.applicationStatusBreakdown[status] || 0;
}


  getStatusPercentage(status: ApplicationStatus): number {
    const total = this.dashboardData.totalApplications || 0;
    if (!total) return 0;

    return Math.round((this.getStatusCount(status) / total) * 100);
  }

  getActiveApplications(): number {
    const activeStatuses: ApplicationStatus[] = [
      ApplicationStatus.APPLIED,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW
    ];

    return activeStatuses.reduce(
      (sum, s) => sum + this.getStatusCount(s),
      0
    );
  }
  toApplicationStatus(value: string | ApplicationStatus): ApplicationStatus {
  if (!value) return ApplicationStatus.APPLIED;

  const upper = value.toUpperCase();

  if (Object.values(ApplicationStatus).includes(upper as ApplicationStatus)) {
    return upper as ApplicationStatus;
  }

  return ApplicationStatus.APPLIED;
}


  // ===========================
  // UI HELPERS
  // ===========================
 getStatusBadgeClass(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    APPLIED: 'bg-primary',
    UNDER_REVIEW: 'bg-info',
    SHORTLISTED: 'bg-secondary',
    INTERVIEW: 'bg-warning',
    OFFERED: 'bg-success',
    REJECTED: 'bg-danger',
    CANCELLED: 'bg-danger'
  };

  return map[status] || 'bg-secondary';
}

  statusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    APPLIED: 'Applied',
    UNDER_REVIEW: 'Under Review',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview',
    OFFERED: 'Offered',
    REJECTED: 'Rejected',
    CANCELLED: 'CANCELLED'
  };
  return labels[status];
}


  getJobTypeLabel(type: string): string {
    const map: Record<string, string> = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      REMOTE: 'Remote',
      INTERNSHIP: 'Internship',
      FREELANCE: 'Freelance'
    };
    return map[type] || type;
  }

  refreshDashboard(): void {
    this.isLoading = true;
    this.loadDashboardData();
    this.loadRecommendedJobs();
  }

  getInterviewPercentage(): number {
  if (!this.dashboardData) return 0;

  const total = this.dashboardData.totalApplications || 0;
  if (total === 0) return 0;

  const interviewCount =
    this.dashboardData.applicationStatusBreakdown?.[ApplicationStatus.INTERVIEW] || 0;

  return Math.round((interviewCount / total) * 100);
}
getSuccessPercentage(): number {
  if (!this.dashboardData) return 0;

  const total = this.dashboardData.totalApplications || 0;
  if (total === 0) return 0;

  const offered =
    this.dashboardData.applicationStatusBreakdown?.[ApplicationStatus.OFFERED] || 0;

  return Math.round((offered / total) * 100);
}

}