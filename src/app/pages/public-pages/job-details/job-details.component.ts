import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from 'src/app/core/services/application.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { JobService } from 'src/app/core/services/job.service';
import { ResumeService } from 'src/app/core/services/resume.service';
import { SavedJobService } from 'src/app/core/services/saved-job.service';
import { Company } from 'src/app/models/company.model';
import { JobApplication, Resume } from 'src/app/models/job-application.model';
import { ExperienceLevel, Job, JobType } from 'src/app/models/job.model';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {
  job: Job | null = null;
  company: Company | null = null;
  loading = true;
  similarJobs: Job[] = [];
  hasApplied = false;
  checkingApplied = false;
  currentUser: any = null;
  resumes: Resume[] = [];
  showApplicationModal = false;
  isSaved = false;
  checkingSaved = false;

  applicationData = {
    resumeId: null as number | null,
    coverLetter: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private companyService: CompanyService,
    private applicationService: ApplicationService,
    private resumeService: ResumeService,
    private authService: AuthService,
    private savedJobService: SavedJobService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const jobId = Number(params['id']);
      if (jobId) {
        this.loadJobDetails(jobId);
        this.recordJobView(jobId);
      }
    });

    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;
      if (user?.id && this.job?.id) {
        this.checkIfApplied(this.job.id);
        this.checkIfSaved(this.job.id);
      }
      if (user?.id) {
        this.loadResumes();
      }
    });
  }

  checkIfApplied(jobId: number): void {
  this.checkingApplied = true;

  this.applicationService.hasApplied(jobId).subscribe({
    next: applied => {
      this.hasApplied = applied;
      this.checkingApplied = false;
    },
    error: () => {
      this.hasApplied = false;
      this.checkingApplied = false;
    }
  });
}


  checkIfSaved(jobId: number): void {
    if (!this.currentUser?.id) return;
    
    this.checkingSaved = true;
    this.savedJobService.isJobSaved(jobId, this.currentUser.id).subscribe({
      next: isSaved => {
        this.isSaved = isSaved;
        this.checkingSaved = false;
      },
      error: () => {
        this.isSaved = false;
        this.checkingSaved = false;
      }
    });
  }

  loadJobDetails(jobId: number): void {
    this.loading = true;
    this.jobService.get(jobId).subscribe({
      next: job => {
        this.job = job;
        this.loading = false;
        if (this.currentUser?.id) {
          this.checkIfApplied(job.id);
          this.checkIfSaved(job.id);
        }
        if (job.company?.id) {
          this.loadCompanyDetails(job.company.id);
        }
        this.loadSimilarJobs(job);
      }
    });
  }

  loadCompanyDetails(companyId: number): void {
    this.companyService.get(companyId).subscribe({
      next: company => (this.company = company),
      error: err => console.error(err)
    });
  }

  loadSimilarJobs(job: Job): void {
    const filter = {
      categoryId: job.category?.id,
      jobType: job.jobType,
      size: 3
    };
    this.jobService.list(filter).subscribe({
      next: res => {
        this.similarJobs = res.items
          .filter(j => j.id !== job.id)
          .slice(0, 3);
      },
      error: err => console.error(err)
    });
  }

  recordJobView(jobId: number): void {
    this.jobService
      .recordView(jobId, this.currentUser?.id, undefined, navigator.userAgent)
      .subscribe({ error: () => {} });
  }

  loadResumes(): void {
    if (!this.currentUser?.id) return;
    this.resumeService.getResumes(this.currentUser.id).subscribe({
      next: (resumes: Resume[]) => {
        this.resumes = resumes;
        // Auto-select primary resume if available
        const primary = resumes.find(r => r.primaryResume);
        if (primary) {
          this.applicationData.resumeId = primary.id;
        }
      },
      error: err => console.error('Resume load failed', err)
    });
  }

  applyForJob(): void {
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.showApplicationModal = true;
  }

  submitApplication(): void {
    if (!this.job?.id) return;
    if (!this.applicationData.resumeId) {
      this.toastService.warning('Please select a resume before applying.');
      return;
    }
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.applicationService
      .apply(
        this.job.id,
        this.applicationData.resumeId,
        this.applicationData.coverLetter
      )
      .subscribe({
        next: application => {
          this.toastService.success('Application submitted successfully!');
          this.showApplicationModal = false;
          this.hasApplied = true;
          this.applicationData = {
            resumeId: null,
            coverLetter: ''
          };
        },
        error: err => {
          console.error('Application error:', err);
          if (err.status === 400) {
            this.toastService.error(err.error?.message || 'Invalid application data.');
          } else if (err.status === 401) {
            this.toastService.error('Please login to apply.');
            this.router.navigate(['/auth/login']);
          } else if (err.status === 409) {
            this.toastService.error('You have already applied for this job.');
          } else {
            this.toastService.error('Failed to submit application.');
          }
        }
      });
  }

  toggleSaveJob(): void {
    if (!this.currentUser) {
      this.toastService.info('Please login to save jobs.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.job?.id) return;

    if (this.isSaved) {
      // Unsave job
      this.savedJobService.unsaveJob(this.job.id, this.currentUser.id).subscribe({
        next: () => {
          this.isSaved = false;
          this.toastService.success('Job removed from saved jobs.');
        },
        error: (err) => {
          console.error('Error unsaving job:', err);
          this.toastService.error('Failed to remove job from saved jobs.');
        }
      });
    } else {
      // Save job
      this.savedJobService.saveJob(this.job.id, this.currentUser.id).subscribe({
        next: (savedJob) => {
          this.isSaved = true;
          this.toastService.success('Job saved successfully!');
        },
        error: (err) => {
          console.error('Error saving job:', err);
          if (err.status === 409) {
            this.toastService.info('Job already saved.');
            this.isSaved = true;
          } else {
            this.toastService.error('Failed to save job.');
          }
        }
      });
    }
  }

  shareJob(): void {
    if (!this.job) return;
    if (navigator.share) {
      navigator.share({
        title: this.job.title,
        text: `Check out this job at ${this.job.company?.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.toastService.success('Link copied to clipboard!');
    }
  }

  getJobTypeIcon(jobType: JobType): string {
    return {
      [JobType.FULL_TIME]: 'bi-briefcase-fill',
      [JobType.PART_TIME]: 'bi-clock-fill',
      [JobType.CONTRACT]: 'bi-file-earmark-text-fill',
      [JobType.REMOTE]: 'bi-laptop-fill',
      [JobType.INTERNSHIP]: 'bi-mortarboard-fill',
      [JobType.FREELANCE]: 'bi-person-workspace'
    }[jobType] || 'bi-briefcase';
  }

  getExperienceText(level: ExperienceLevel): string {
    return {
      [ExperienceLevel.ENTRY]: 'Entry Level (0-2 years)',
      [ExperienceLevel.MID]: 'Mid Level (3-5 years)',
      [ExperienceLevel.SENIOR]: 'Senior Level (6+ years)',
      [ExperienceLevel.DIRECTOR]: 'Director',
      [ExperienceLevel.EXECUTIVE]: 'Executive'
    }[level] || level;
  }

  viewSavedJobs(): void {
    this.router.navigate(['/job-seeker/saved-jobs']);
  }

  isJobSeeker(): boolean {
  return this.currentUser?.role === 'JOB_SEEKER';
}

isEmployer(): boolean {
  return this.currentUser?.role === 'EMPLOYER';
}
 redirectToJobSeekerLogin(): void {
  if (confirm('Are you sure you want to logout?')) {
    this.authService.forceLogout(); // optional but recommended
    this.router.navigate(['/auth/login'], {
      queryParams: { role: 'JOB_SEEKER', redirect: this.router.url }
    });
  }
}

}
