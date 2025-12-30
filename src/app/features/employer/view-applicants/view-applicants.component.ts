import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { ApplicationService } from 'src/app/core/services/application.service';
import { JobService } from 'src/app/core/services/job.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ApplicationStatus, JobApplication } from 'src/app/models/job-application.model';
import { Job } from 'src/app/models/job.model';
import { Pagination } from 'src/app/models/pagination.model';

@Component({
  selector: 'app-view-applicants',
  templateUrl: './view-applicants.component.html',
  styleUrls: ['./view-applicants.component.scss']
})
export class ViewApplicantsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  jobId: number | null = null;
  job: Job | null = null;
  applications: JobApplication[] = [];
  pagination: Pagination<JobApplication> | null = null;
  
  // UI Notifications
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' | 'info' = 'info';
  notificationTimeout: any;
  
  // Filters
  filterForm = new FormGroup({
    status: new FormControl(''),
    search: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl('')
  });
  
  // Loading states
  loading = true;
  loadingJob = true;
  updatingStatus: { [key: number]: boolean } = {};
  downloadingResume: { [key: number]: boolean } = {};
  
  // Stats
  stats: { [key: string]: number } = {};
  totalApplications = 0;
  
  // Application status enum
  ApplicationStatus = ApplicationStatus;
  statusOptions = Object.values(ApplicationStatus);
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 0;
  
  // View modes
  viewMode: 'list' | 'grid' = 'list';
  selectedApplications: Set<number> = new Set();
  selectAll = false;
  
  // Cover letter modal
  selectedCoverLetter: JobApplication | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private jobService: JobService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.jobId = +this.route.snapshot.params['jobId'];
    
    if (!this.jobId || isNaN(this.jobId)) {
      this.router.navigate(['/employer/manage-jobs']);
      return;
    }
    
    this.loadJob();
    this.loadApplications();
    this.setupFilters();
    
    // Listen to notifications from service
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.showUINotification(notification.message, notification.type, notification.duration);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  private loadJob(): void {
    this.loadingJob = true;
    this.jobService.get(this.jobId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (job) => {
          this.job = job;
          this.loadingJob = false;
        },
        error: (error) => {
          console.error('Failed to load job:', error);
          this.showUINotification('Failed to load job details', 'error');
          this.loadingJob = false;
        }
      });
  }

  private loadApplications(): void {
    this.loading = true;
    
    this.applicationService.getApplicationsByJob(this.jobId!, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.applications = response.items;
          this.pagination = response;
          this.totalPages = response.totalPages;
          this.totalApplications = response.totalItems;
          this.calculateStats();
          this.loading = false;
          
          // Reset selection when data changes
          this.selectedApplications.clear();
          this.selectAll = false;
        },
        error: (error) => {
          console.error('Failed to load applications:', error);
          this.showUINotification('Failed to load applications', 'error');
          this.loading = false;
        }
      });
  }

  private showUINotification(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 5000): void {
    // Clear any existing notification
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Auto-hide after duration
    this.notificationTimeout = setTimeout(() => {
      this.showNotification = false;
    }, duration);
  }

  hideNotification(): void {
    this.showNotification = false;
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  private setupFilters(): void {
    // Setup debounced search
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadApplications();
      });
    
    // Status filter change
    this.filterForm.get('status')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadApplications();
      });
    
    // Date filters with validation
    this.filterForm.get('dateFrom')?.valueChanges
      .pipe(
        debounceTime(300),
        filter(() => this.validateDates()),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadApplications();
      });
    
    this.filterForm.get('dateTo')?.valueChanges
      .pipe(
        debounceTime(300),
        filter(() => this.validateDates()),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadApplications();
      });
  }

  private validateDates(): boolean {
    const dateFrom = this.filterForm.get('dateFrom')?.value;
    const dateTo = this.filterForm.get('dateTo')?.value;
    
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      if (fromDate > toDate) {
        this.showUINotification('"Date From" cannot be after "Date To"', 'warning');
        return false;
      }
    }
    return true;
  }

  private calculateStats(): void {
    this.stats = {};
    this.applications.forEach(app => {
      this.stats[app.status] = (this.stats[app.status] || 0) + 1;
    });
  }

  updateApplicationStatus(applicationId: number, status: ApplicationStatus): void {
    if (!confirm('Are you sure you want to update this application status?')) {
      return;
    }

    this.updatingStatus[applicationId] = true;
    
    this.applicationService.updateApplicationStatus(applicationId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedApp) => {
          const index = this.applications.findIndex(a => a.id === applicationId);
          if (index !== -1) {
            this.applications[index] = updatedApp;
            this.calculateStats();
          }
          this.updatingStatus[applicationId] = false;
          this.notificationService.showSuccess('Status updated successfully');
        },
        error: (error) => {
          console.error('Failed to update status:', error);
          this.updatingStatus[applicationId] = false;
          this.notificationService.showError('Failed to update status');
        }
      });
  }

  viewApplicantProfile(jobSeekerId: number): void {
    this.router.navigate(['/employer/applicant', jobSeekerId], {
      queryParams: { jobId: this.jobId }
    });
  }
  

  downloadResume(applicationId: number, resumeUrl?: string): void {
  if (!resumeUrl) {
    this.notificationService.showWarning('No resume available for download');
    return;
  }

  this.downloadingResume[applicationId] = true;

  const application = this.applications.find(app => app.id === applicationId);

  if (!application) {
    this.notificationService.showError('Application not found');
    this.downloadingResume[applicationId] = false;
    return;
  }

  const safeName = application.jobSeekerName
    ? application.jobSeekerName.replace(/\s+/g, '_')
    : 'applicant';

  const fileName = `resume_${safeName}_${Date.now()}.pdf`;

  const link = document.createElement('a');
  link.href = resumeUrl;
  link.target = '_blank';
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  this.downloadingResume[applicationId] = false;
  this.notificationService.showInfo('Resume download started');
}


  getStatusClass(status: ApplicationStatus): string {
    const classes: { [key: string]: string } = {
      [ApplicationStatus.APPLIED]: 'applied',
      [ApplicationStatus.UNDER_REVIEW]: 'under-review',
      [ApplicationStatus.SHORTLISTED]: 'shortlisted',
      [ApplicationStatus.INTERVIEW]: 'interview',
      [ApplicationStatus.OFFERED]: 'offered',
      [ApplicationStatus.REJECTED]: 'rejected'
    };
    return classes[status] || 'applied';
  }

  getStatusColor(status: ApplicationStatus): string {
    const colors: { [key: string]: string } = {
      [ApplicationStatus.APPLIED]: '#3B82F6', // blue
      [ApplicationStatus.UNDER_REVIEW]: '#F59E0B', // amber
      [ApplicationStatus.SHORTLISTED]: '#8B5CF6', // violet
      [ApplicationStatus.INTERVIEW]: '#10B981', // emerald
      [ApplicationStatus.OFFERED]: '#0D9488', // teal
      [ApplicationStatus.REJECTED]: '#EF4444' // red
    };
    return colors[status] || '#6B7280'; // gray as default
  }

  // Selection Methods
  toggleSelectAll(): void {
    if (!this.selectAll) {
      // Select all
      this.applications.forEach(app => this.selectedApplications.add(app.id));
      this.selectAll = true;
    } else {
      // Deselect all
      this.selectedApplications.clear();
      this.selectAll = false;
    }
  }

  onSelectAllChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAll = checkbox.checked;
    this.toggleSelectAll();
  }

  toggleApplicationSelection(applicationId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.selectedApplications.has(applicationId)) {
      this.selectedApplications.delete(applicationId);
    } else {
      this.selectedApplications.add(applicationId);
    }
    
    // Update selectAll based on current selection
    this.selectAll = this.selectedApplications.size === this.applications.length;
  }

  bulkUpdateStatus(status: string): void {
    // Convert string to ApplicationStatus enum
    const applicationStatus = status as ApplicationStatus;
    
    if (!applicationStatus) {
      this.notificationService.showWarning('Please select a status');
      return;
    }

    if (this.selectedApplications.size === 0) {
      this.notificationService.showWarning('Please select at least one application');
      return;
    }
    
    if (!confirm(`Update ${this.selectedApplications.size} application(s) to ${applicationStatus}?`)) {
      return;
    }

    const updatePromises = Array.from(this.selectedApplications).map(applicationId => 
      this.applicationService.updateApplicationStatus(applicationId, applicationStatus).toPromise()
    );

    Promise.all(updatePromises)
      .then(() => {
        this.notificationService.showSuccess(`Updated ${this.selectedApplications.size} application(s)`);
        this.selectedApplications.clear();
        this.selectAll = false;
        this.loadApplications();
      })
      .catch(error => {
        console.error('Failed to bulk update:', error);
        this.notificationService.showError('Failed to update some applications');
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadApplications();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = parseInt(select.value, 10);
    this.currentPage = 0;
    this.loadApplications();
  }

  exportToCSV(): void {
    if (this.applications.length === 0) {
      this.notificationService.showWarning('No applications to export');
      return;
    }
    
    const csvData = this.applications.map(app => ({
  'Applicant ID': app.jobSeekerId,
  'Applicant Name': app.jobSeekerName || 'N/A',
  'Email': app.jobSeekerEmail || 'N/A',
  'Status': app.status,
  'Applied Date': this.formatDateForExport(app.appliedAt),
  'Resume Available': app.resumeUrl ? 'Yes' : 'No',
  'Cover Letter': app.coverLetter
    ? app.coverLetter.substring(0, 200) + (app.coverLetter.length > 200 ? '...' : '')
    : '',
  'Job Title': this.job?.title || app.jobTitle || 'N/A',
  'Company': this.job?.company?.name || app.companyName || 'N/A'
}));

    
    const csvContent = this.convertToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const safeJobTitle = this.job?.title?.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') || 'job';
    const fileName = `applications_${safeJobTitle}_${new Date().toISOString().split('T')[0]}.csv`;
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.notificationService.showSuccess('Export completed successfully');
  }

 formatDateForExport(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(); 
}

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }

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

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    this.currentPage = 0;
    this.loadApplications();
  }

  getFormattedDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

 getRelativeTime(date: string | Date): string {
  const now = new Date();
  const appliedDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = now.getTime() - appliedDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    }
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }
  
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

  // Cover letter methods
  viewCoverLetter(application: JobApplication): void {
    this.selectedCoverLetter = application;
  }

  closeCoverLetter(): void {
    this.selectedCoverLetter = null;
  }

  // Get filtered applications for display
  get filteredApplications(): JobApplication[] {
    const searchTerm = this.filterForm.get('search')?.value?.toLowerCase() || '';
    const statusFilter = this.filterForm.get('status')?.value;
    const dateFrom = this.filterForm.get('dateFrom')?.value;
    const dateTo = this.filterForm.get('dateTo')?.value;
    
    return this.applications.filter(app => {
      // Search filter
      const matchesSearch = !searchTerm ||
  (app.jobSeekerName || '').toLowerCase().includes(searchTerm) ||
  (app.jobSeekerEmail || '').toLowerCase().includes(searchTerm) ||
  app.coverLetter?.toLowerCase().includes(searchTerm);

      
      // Status filter
      const matchesStatus = !statusFilter || app.status === statusFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const appliedDate = new Date(app.appliedAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDate = matchesDate && appliedDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          matchesDate = matchesDate && appliedDate <= toDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  // Notification UI methods
  getNotificationClass(): string {
    const baseClasses = 'notification p-4 rounded-lg shadow-lg mb-2 max-w-md';
    switch (this.notificationType) {
      case 'success':
        return `${baseClasses} bg-green-50 border-l-4 border-green-500 text-green-700`;
      case 'error':
        return `${baseClasses} bg-red-50 border-l-4 border-red-500 text-red-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-l-4 border-blue-500 text-blue-700`;
      default:
        return `${baseClasses} bg-gray-50 border-l-4 border-gray-500 text-gray-700`;
    }
  }

  getNotificationTitle(): string {
    switch (this.notificationType) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  }

 navigateMangejob() {
  this.router.navigate(['/employer/manage-jobs']);
}
}