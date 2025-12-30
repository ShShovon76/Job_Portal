import { Component, OnInit } from '@angular/core';

import { ApplicationService } from 'src/app/core/services/application.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobApplication } from 'src/app/models/job-application.model';
import { ToastService } from 'src/app/services/toast.service';



@Component({
  selector: 'app-applied-jobs',
  templateUrl: './applied-jobs.component.html',
  styleUrls: ['./applied-jobs.component.scss']
})
export class AppliedJobsComponent implements OnInit {

  appliedJobs: JobApplication[] = [];
  loading = true;
  errorMessage = '';
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAppliedJobs();
  }

  loadAppliedJobs(): void {
    this.loading = true;

    const user = this.authService.getCurrentUserSnapshot();
    if (!user?.id) {
      this.loading = false;
      return;
    }

    this.applicationService
      .getApplicationsByJobSeeker(user.id, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.appliedJobs = res.items;
          this.totalItems = res.totalItems;
          this.loading = false;
        },
        error: () => {
          this.toast.error('Failed to load applied jobs');
          this.loading = false;
        }
      });
  }

 deleteApplication(application: JobApplication): void {
  if (!application?.id) return;

  if (!confirm('Are you sure you want to delete this application?')) return;

  this.applicationService.withdrawApplication(application.id).subscribe({
    next: () => {
      this.toast.success('Application deleted successfully');
      this.appliedJobs = this.appliedJobs.filter(a => a.id !== application.id);
    },
    error: err => {
      this.toast.error(err?.error?.message || 'Delete failed');
    }
  });
}


  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPLIED': return 'bg-primary';
      case 'UNDER_REVIEW': return 'bg-info text-dark';
      case 'SHORTLISTED': return 'bg-warning text-dark';
      case 'INTERVIEW': return 'bg-secondary';
      case 'OFFERED': return 'bg-success';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAppliedJobs();
  }
}