import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobService } from 'src/app/core/services/job.service';
import { CreateJobPayload, Job, JobStatus } from 'src/app/models/job.model';
import { Pagination } from 'src/app/models/pagination.model';
import { User } from 'src/app/models/user.model';
import { Modal } from 'bootstrap';
import { addDays, differenceInDays, formatDistanceToNow, parseISO } from 'date-fns';


@Component({
  selector: 'app-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss']
})
export class ManageJobsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  Math = Math;
  jobs: Job[] = [];
  pagination: Pagination<Job> | null = null;
  currentUser: User | null = null;
  
  // Filters
  searchControl = new FormControl('');
  statusFilter = new FormControl('');
  jobTypeFilter = new FormControl('');
  
  // Loading states
  loading = true;
  deletingJobId: number | null = null;
  
  // Stats
  stats = {
    active: 0,
    closed: 0,
    draft: 0,
    total: 0
  };
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  
  // Job status enum
  JobStatus = JobStatus;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSnapshot();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadJobs();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadJobs(): void {
    if (!this.currentUser?.id) return;
    
    this.loading = true;
    
    const filters = {
      page: this.currentPage,
      size: this.pageSize,
      status: this.statusFilter.value || undefined,
      jobType: this.jobTypeFilter.value || undefined,
      keyword: this.searchControl.value || undefined
    };
    
    this.jobService.listByEmployer(this.currentUser.id, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.jobs = response.items;
          this.pagination = response;
          this.totalPages = response.totalPages;
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load jobs:', error);
          this.loading = false;
        }
      });
  }

  private setupFilters(): void {
    // Debounce search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadJobs();
      });
    
    // Status filter
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadJobs();
      });
    
    // Job type filter
    this.jobTypeFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadJobs();
      });
  }

 private calculateStats(): void {
  // Use string values instead of enum
  this.stats = {
    active: this.jobs.filter(j => j.status === 'ACTIVE').length,
    closed: this.jobs.filter(j => j.status === 'CLOSED').length,
    draft: this.jobs.filter(j => j.status === 'DRAFT').length,
    total: this.jobs.length
  };
}

  getStatusClass(status: JobStatus): string {
    switch (status) {
      case JobStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case JobStatus.CLOSED: return 'bg-red-100 text-red-800';
      case JobStatus.DRAFT: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  editJob(jobId: number | undefined): void {
  if (jobId) {
    this.router.navigate(['/employer/edit-job', jobId]);
  }
}

viewApplicants(jobId: number | undefined): void {
  if (jobId) {
    this.router.navigate(['/employer/applicants', jobId]);
  }
}

closeJob(jobId: number | undefined): void {
  if (!jobId || !this.currentUser?.id) return;
  
  this.jobService.update(jobId, this.currentUser.id, { status: JobStatus.CLOSED })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
          job.status = JobStatus.CLOSED;
        }
        this.calculateStats();
      },
      error: (error) => {
        console.error('Failed to close job:', error);
      }
    });
}

  deleteJob(jobId: number | undefined): void {
  // Add this check at the beginning
  if (!jobId || !this.currentUser?.id) return;
  
  if (!confirm('Are you sure you want to delete this job?')) {
    return;
  }
  
  this.deletingJobId = jobId;
  this.jobService.delete(jobId, this.currentUser.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j.id !== jobId);
        this.deletingJobId = null;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Failed to delete job:', error);
        this.deletingJobId = null;
      }
    });
}

duplicateJob(job: Job): void {
  if (!this.currentUser?.id) return;
  
  // Validate required IDs
  if (!job.company?.id) {
    console.error('Cannot duplicate job: missing company ID');
    return;
  }
  
  if (!job.category?.id) {
    console.error('Cannot duplicate job: missing category ID');
    return;
  }

  const duplicatedJob: CreateJobPayload = {
    companyId: job.company.id,
    categoryId: job.category.id,
    title: `${job.title} (Copy)`,
    description: job.description,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    salaryType: job.salaryType,
    location: job.location,
    remoteAllowed: job.remoteAllowed,
    skills: [...job.skills], // Create a copy to avoid reference issues
    deadline: job.deadline
    // Note: status is not included as CreateJobPayload doesn't have it
  };

  this.loading = true;
  
  this.jobService.create(this.currentUser.id, duplicatedJob).subscribe({
    next: (createdJob) => {
      console.log('Job duplicated successfully:', createdJob);
      this.loading = false;
      
      // Refresh the job list or add the new job to the list
      this.loadJobs();
    },
    error: (error: HttpErrorResponse) => {
      console.error('Error duplicating job:', error);
      this.loading = false;
      alert('Failed to duplicate job. Please try again.');
    }
  });
}


  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadJobs();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue('');
    this.jobTypeFilter.setValue('');
    this.currentPage = 0;
    this.loadJobs();
  }

  // Add these methods to your ManageJobsComponent class:

getPageNumbers(): number[] {
  const maxVisible = 5;
  let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(this.totalPages - 1, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(0, end - maxVisible + 1);
  }
  
  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
}

getLastPages(): number[] {
  if (this.totalPages <= 7) return [];
  if (this.currentPage >= this.totalPages - 4) return [];
  
  return [this.totalPages - 2, this.totalPages - 1];
}
  isDeadlineApproaching(deadline: string): boolean {
  if (!deadline) return false;
  
  const deadlineDate = parseISO(deadline);
  const now = new Date();
  const daysRemaining = differenceInDays(deadlineDate, now);
  
  return daysRemaining <= 7 && daysRemaining > 0;
}

getDaysRemaining(deadline: string): string {
  if (!deadline) return 'N/A';
  
  const deadlineDate = parseISO(deadline);
  const now = new Date();
  const days = differenceInDays(deadlineDate, now);
  
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

getTimeAgo(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
}

// Add reopenJob method
reopenJob(job: Job): void {
  if (!job.id || !this.currentUser?.id) return;
  
  const confirmed = confirm('Are you sure you want to reopen this job?');
  if (!confirmed) return;
  
  this.jobService.update(job.id, this.currentUser.id, { 
    status: JobStatus.ACTIVE,
    deadline: addDays(new Date(), 30).toISOString().split('T')[0] // Extend deadline by 30 days
  })
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (updatedJob) => {
      const index = this.jobs.findIndex(j => j.id === job.id);
      if (index !== -1) {
        this.jobs[index] = updatedJob;
        this.calculateStats();
      }
    },
    error: (error) => {
      console.error('Failed to reopen job:', error);
      alert('Failed to reopen job. Please try again.');
    }
  });
}

// Add getApplicantStatus method
getApplicantStatus(count: number): string {
  if (count === 0) return 'No applicants yet';
  if (count === 1) return '1 applicant';
  return `${count} applicants`;
}

// Add this property to store job to delete
private jobToDeleteId: number | null = null;

delete(jobId: number | undefined): void {
  if (!jobId) return;

  this.jobToDeleteId = jobId;

  const modalElement = document.getElementById('deleteConfirmModal');
  if (!modalElement) return;

  const modal = new Modal(modalElement);
  modal.show();
}

confirmDelete(): void {
  if (!this.jobToDeleteId || !this.currentUser?.id) return;

  const jobId = this.jobToDeleteId;
  this.deletingJobId = jobId;

  this.jobService.delete(jobId, this.currentUser.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.jobs = this.jobs.filter(j => j.id !== jobId);
        this.deletingJobId = null;
        this.jobToDeleteId = null;
        this.calculateStats();

        // Close modal
        const modalElement = document.getElementById('deleteConfirmModal');
        if (modalElement) {
          Modal.getInstance(modalElement)?.hide();
        }

        console.log('Job deleted successfully');
      },
      error: (error) => {
        console.error('Failed to delete job:', error);
        this.deletingJobId = null;
        this.jobToDeleteId = null;
        alert('Failed to delete job. Please try again.');
      }
    });
}
cancelDelete(): void {
  this.jobToDeleteId = null;

  const modalElement = document.getElementById('deleteConfirmModal');
  if (!modalElement) return;

  const modal = Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
 activeDropdownId: number | null = null;
  
  toggleJobDropdown(jobId: number): void {
    this.activeDropdownId = this.activeDropdownId === jobId ? null : jobId;
  }
  
  closeDropdown(): void {
    this.activeDropdownId = null;
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.closeDropdown();
    }
  }

}
