import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CategoryService } from 'src/app/core/services/category.service';
import { JobService } from 'src/app/core/services/job.service';
import { JobSearchFilter } from 'src/app/models/job-search-filter.model';
import { ExperienceLevel, Job, JobType } from 'src/app/models/job.model';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {

  // -------------------------
  // DATA
  // -------------------------
  jobs: Job[] = [];
  loading = false;

  totalJobs = 0;
  currentPage = 1;
  itemsPerPage = 10;

  categories: { id: number; name: string }[] = [];

  // -------------------------
  // FILTER STATE
  // -------------------------
  searchForm!: FormGroup;

  selectedJobType: JobType | 'ALL' = 'ALL';
  selectedExperience: ExperienceLevel | 'ALL' = 'ALL';
  selectedRemote: boolean | null = null;
  selectedCategoryId: number | null = null;

  // -------------------------
  // ENUM SOURCES (STRONGLY TYPED)
  // -------------------------
  readonly jobTypes: JobType[] = [
    JobType.FULL_TIME,
    JobType.PART_TIME,
    JobType.CONTRACT,
    JobType.REMOTE,
    JobType.INTERNSHIP,
    JobType.FREELANCE
  ];

  readonly experienceLevels: ExperienceLevel[] = [
    ExperienceLevel.ENTRY,
    ExperienceLevel.MID,
    ExperienceLevel.SENIOR,
    ExperienceLevel.DIRECTOR,
    ExperienceLevel.EXECUTIVE
  ];

  constructor(
    private readonly jobService: JobService,
    private readonly categoryService: CategoryService,
    private readonly fb: FormBuilder
  ) {}

  // -------------------------
  // LIFECYCLE
  // -------------------------
  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadJobs();

    // auto search on input change
    this.searchForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadJobs();
    });
  }

  // -------------------------
  // FORM
  // -------------------------
  private initForm(): void {
    this.searchForm = this.fb.group({
      keyword: [''],
      location: [''],
      minSalary: [''],
      maxSalary: ['']
    });
  }

  // -------------------------
  // DATA LOADING
  // -------------------------
  loadJobs(): void {
    this.loading = true;

    const formValue = this.searchForm.value;

    const filter: JobSearchFilter = {
      page: this.currentPage - 1,
      size: this.itemsPerPage,
      keyword: formValue.keyword || undefined,
      location: formValue.location || undefined,
      remote: this.selectedRemote ?? undefined,
      categoryId: this.selectedCategoryId ?? undefined
    };

    if (this.selectedJobType !== 'ALL') {
      filter.jobType = this.selectedJobType;
    }

    if (this.selectedExperience !== 'ALL') {
      filter.experienceLevel = this.selectedExperience;
    }

    if (formValue.minSalary || formValue.maxSalary) {
      filter.salaryRange = {
        min: Number(formValue.minSalary) || 0,
        max: Number(formValue.maxSalary) || undefined
      };
    }

    this.jobService.list(filter).subscribe({
      next: res => {
        this.jobs = res.items;
        this.totalJobs = res.totalItems;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load jobs', err);
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
  this.categoryService.getAllCategories().subscribe({
    next: res => {
      this.categories = res;
    },
    error: err => {
      console.error('Failed to load categories', err);
    }
  });
}


  // -------------------------
  // PAGINATION (BOOTSTRAP ONLY)
  // -------------------------
  get totalPages(): number {
    return Math.ceil(this.totalJobs / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // -------------------------
  // FILTER HELPERS
  // -------------------------
  clearFilters(): void {
    this.searchForm.reset();
    this.selectedJobType = 'ALL';
    this.selectedExperience = 'ALL';
    this.selectedRemote = null;
    this.selectedCategoryId = null;
    this.currentPage = 1;
    this.loadJobs();
  }

  // -------------------------
  // UI HELPERS
  // -------------------------
  getJobTypeIcon(type: JobType): string {
    switch (type) {
      case JobType.FULL_TIME: return 'bi-briefcase-fill';
      case JobType.PART_TIME: return 'bi-clock-fill';
      case JobType.CONTRACT: return 'bi-file-earmark-text-fill';
      case JobType.REMOTE: return 'bi-laptop-fill';
      case JobType.INTERNSHIP: return 'bi-mortarboard-fill';
      case JobType.FREELANCE: return 'bi-person-workspace';
      default: return 'bi-briefcase';
    }
  }

  getExperienceBadgeClass(level: ExperienceLevel): string {
    switch (level) {
      case ExperienceLevel.ENTRY: return 'bg-primary';
      case ExperienceLevel.MID: return 'bg-success';
      case ExperienceLevel.SENIOR: return 'bg-warning';
      case ExperienceLevel.DIRECTOR: return 'bg-info';
      case ExperienceLevel.EXECUTIVE: return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  getDaysAgo(dateInput: any): string {
  if (!dateInput) return 'N/A';
  
  // Convert string to Date object if necessary
  const d = new Date(dateInput);
  
  // Check if the date is actually valid
  if (isNaN(d.getTime())) return 'Invalid Date';

  const diff = Math.floor(
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If the date is in the future (for the "Closes" field)
  if (diff < 0) {
    const futureDiff = Math.abs(diff);
    if (futureDiff === 1) return 'Tomorrow';
    return `in ${futureDiff} days`;
  }

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}
}
