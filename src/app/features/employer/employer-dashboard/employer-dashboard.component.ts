import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { ApplicationService } from 'src/app/core/services/application.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { JobService } from 'src/app/core/services/job.service';
import { EmployerDashboardResponse } from 'src/app/models/analytics.models';
import { Company } from 'src/app/models/company.model';
import { JobApplication } from 'src/app/models/job-application.model';
import { Job } from 'src/app/models/job.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-employer-dashboard',
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.scss']
})
export class EmployerDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Dashboard data
  dashboardData: EmployerDashboardResponse | null = null;
  recentJobs: Job[] = [];
  recentApplications: JobApplication[] = [];
  companies: Company[] = [];
  
  // User info
  currentUser: User | null = null;
  
  // Loading states
  loadingDashboard = true;
  loadingJobs = true;
  loadingApplications = true;
  loadingCompanies = true;
  
  // Stats for quick view
  totalStats = {
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    profileViews: 0
  };
  
  // Chart data
  applicationsChartData: any;
  viewsChartData: any;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(
    private analyticsService: AnalyticsService,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSnapshot();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadDashboardData();
    this.loadRecentJobs();
    this.loadRecentApplications();
    this.loadCompanies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    if (!this.currentUser?.id) return;
    
    this.analyticsService.getEmployerDashboard(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.totalStats.activeJobs = data.activeJobs;
          this.totalStats.totalApplications = data.totalApplications;
          this.prepareCharts(data);
          this.loadingDashboard = false;
        },
        error: (error) => {
          console.error('Failed to load dashboard:', error);
          this.loadingDashboard = false;
        }
      });
  }

 private loadRecentJobs(): void {
  if (!this.currentUser?.id) return;
  
  this.jobService.listByEmployer(this.currentUser.id, { page: 0, size: 5 })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.recentJobs = response.items ?? [];
        this.loadingJobs = false;
      },
      error: (error) => {
        console.error('Failed to load jobs:', error);
        this.loadingJobs = false;
      }
    });
}


  private loadRecentApplications(): void {
  if (!this.currentUser?.id) return;
  
  this.applicationService.getApplicationsByEmployer(this.currentUser.id, 0, 5)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        // Use the null-coalescing operator to ensure items is at least an empty array
        const items = response?.items ?? []; 
        
        this.recentApplications = items;
        
        // Use the local 'items' constant which is guaranteed to be an array
        this.totalStats.interviewsScheduled = items
          .filter(app => app.status === 'INTERVIEW')
          .length;
          
        this.loadingApplications = false;
      },
      error: (error) => {
        console.error('Failed to load applications:', error);
        this.loadingApplications = false;
      }
    });
}

  private loadCompanies(): void {
    if (!this.currentUser?.id) return;
    
    this.companyService.getCompaniesByOwner(this.currentUser.id, { page: 0, size: 3 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.companies = response.items;
          this.loadingCompanies = false;
        },
        error: (error) => {
          console.error('Failed to load companies:', error);
          this.loadingCompanies = false;
        }
      });
  }

  private prepareCharts(data: EmployerDashboardResponse): void {
    // Applications chart
    this.applicationsChartData = {
      labels: Object.keys(data.applicationStatusBreakdown),
      datasets: [{
        data: Object.values(data.applicationStatusBreakdown),
        backgroundColor: [
          '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ]
      }]
    };

    // Job views chart
    if (data.topViewedJobs && data.topViewedJobs.length > 0) {
      this.viewsChartData = {
        labels: data.topViewedJobs.map(job => job.jobTitle.substring(0, 15) + '...'),
        datasets: [{
          label: 'Views',
          data: data.topViewedJobs.map(job => job.views),
          backgroundColor: '#36A2EB'
        }, {
          label: 'Applicants',
          data: data.topViewedJobs.map(job => job.applicants),
          backgroundColor: '#FF6384'
        }]
      };
    }
  }

  navigateToJob(jobId: number): void {
    this.router.navigate(['/employer/edit-job', jobId]);
  }

  navigateToApplicants(jobId: number): void {
    this.router.navigate(['/employer/applicants', jobId]);
  }

  navigateToCompany(companyId: number): void {
    this.router.navigate(['/employer/company-profile']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'APPLIED': 'bg-blue-100 text-blue-800',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
      'SHORTLISTED': 'bg-purple-100 text-purple-800',
      'INTERVIEW': 'bg-green-100 text-green-800',
      'OFFERED': 'bg-teal-100 text-teal-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getApplicationCountByStatus(status: string): number {
    if (!this.dashboardData?.applicationStatusBreakdown) return 0;
    return this.dashboardData.applicationStatusBreakdown[status] || 0;
  }
}
