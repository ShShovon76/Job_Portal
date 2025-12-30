import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobService } from 'src/app/core/services/job.service';
import { SavedJobService } from 'src/app/core/services/saved-job.service';
import { Job, JobType } from 'src/app/models/job.model';
import { SavedJob } from 'src/app/models/saved-job.model';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-saved-jobs',
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./saved-jobs.component.scss']
})
export class SavedJobsComponent implements OnInit {
  savedJobs: SavedJob[] = [];
  loading = true;
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  currentUser: any = null;

  // Statistics properties
  activeJobsCount = 0;
  remoteJobsCount = 0;
  expiringSoonCount = 0;

  constructor(
    private savedJobService: SavedJobService,
    private authService: AuthService,
    private jobService: JobService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser$().subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user?.id) {
          this.loadSavedJobs();
        } else {
          this.router.navigate(['/auth/login']);
        }
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  loadSavedJobs(page: number = 0): void {
  if (!this.currentUser?.id) return;

  this.loading = true;

  this.savedJobService.getSavedJobs({
  page,
  size: this.pageSize
}).subscribe
({
    next: (response) => {
      this.savedJobs = response.items || [];
      this.totalItems = response.totalItems;
      this.totalPages = response.totalPages;
      this.currentPage = response.page;

      this.calculateStatistics();
      this.loading = false;
    },
    error: () => {
      this.toastService.error('Failed to load saved jobs.');
      this.loading = false;
    }
  });
}

  calculateStatistics(): void {
    this.activeJobsCount = this.savedJobs.filter(j => j.job?.status === 'ACTIVE').length;
    this.remoteJobsCount = this.savedJobs.filter(j => j.job?.remoteAllowed).length;
    this.expiringSoonCount = this.savedJobs.filter(j => this.isExpiringSoon(j.job?.deadline)).length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSavedJobs(page);
  }

  unsaveJob(savedJobId: number, event: Event): void {
    event.stopPropagation();
    
    if (!this.currentUser?.id) return;

    this.savedJobService.unsaveJobById(savedJobId, this.currentUser.id).subscribe({
      next: () => {
        this.savedJobs = this.savedJobs.filter(job => job.id !== savedJobId);
        this.totalItems--;
        this.calculateStatistics(); // Recalculate after removal
        this.toastService.success('Job removed from saved jobs.');
      },
      error: (err) => {
        console.error('Error removing saved job:', err);
        this.toastService.error('Failed to remove job from saved jobs.');
      }
    });
  }

  unsaveAllJobs(): void {
    if (!this.currentUser?.id || this.savedJobs.length === 0) return;

    if (confirm('Are you sure you want to remove all saved jobs?')) {
      // This would require a backend endpoint to delete all saved jobs for a user
      // For now, we'll delete them one by one
      let completed = 0;
      const total = this.savedJobs.length;
      
      this.savedJobs.forEach(savedJob => {
        this.savedJobService.unsaveJobById(savedJob.id, this.currentUser.id).subscribe({
          next: () => {
            completed++;
            if (completed === total) {
              this.savedJobs = [];
              this.totalItems = 0;
              this.activeJobsCount = 0;
              this.remoteJobsCount = 0;
              this.expiringSoonCount = 0;
              this.toastService.success('All saved jobs removed.');
            }
          },
          error: (err) => {
            completed++;
            console.error('Error removing saved job:', err);
          }
        });
      });
    }
  }

  viewJobDetails(jobId?: number): void {
    if (jobId) {
      this.router.navigate(['/jobs', jobId]);
    }
  }

  applyForJob(jobId?: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (jobId) {
      this.router.navigate(['/jobs', jobId], { fragment: 'apply' });
    }
  }

  getJobTypeIcon(jobType?: JobType | string): string {
    if (!jobType) return 'bi-briefcase';
    
    const jobTypes: Record<string, string> = {
      'FULL_TIME': 'bi-briefcase-fill',
      'PART_TIME': 'bi-clock-fill',
      'CONTRACT': 'bi-file-earmark-text-fill',
      'REMOTE': 'bi-laptop-fill',
      'INTERNSHIP': 'bi-mortarboard-fill',
      'FREELANCE': 'bi-person-workspace'
    };
    
    // Handle both string and enum types
    const typeString = typeof jobType === 'string' ? jobType : (jobType as JobType).toString();
    return jobTypes[typeString] || 'bi-briefcase';
  }

  getTimeAgo(date?: Date | string): string {
    if (!date) return 'Recently';
    
    const now = new Date();
    const savedDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(savedDate.getTime())) return 'Recently';
    
    const diffInSeconds = Math.floor((now.getTime() - savedDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  }

  getSalaryRange(job?: any): string {
    if (!job) return 'Salary not specified';
    if (!job.minSalary && !job.maxSalary) return 'Salary not specified';
    if (job.minSalary && job.maxSalary) {
      const salaryType = job.salaryType ? job.salaryType.toLowerCase() : 'yearly';
      return `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()} ${salaryType}`;
    }
    if (job.minSalary) return `From $${job.minSalary.toLocaleString()}`;
    if (job.maxSalary) return `Up to $${job.maxSalary.toLocaleString()}`;
    return '';
  }

  isExpiringSoon(deadline?: string): boolean {
    if (!deadline) return false;
    
    try {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part
      
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 7 && diffDays > 0;
    } catch {
      return false;
    }
  }

  getSkillsArray(skills?: string[]): string[] {
    return skills || [];
  }
  // Add these methods to the class
getPageNumbers(): number[] {
  const pages: number[] = [];
  for (let i = 0; i < this.totalPages; i++) {
    pages.push(i);
  }
  return pages;
}

formatJobType(jobType?: string): string {
  if (!jobType) return '';
  return jobType.replace('_', ' ');
}

formatDate(date?: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}
}
