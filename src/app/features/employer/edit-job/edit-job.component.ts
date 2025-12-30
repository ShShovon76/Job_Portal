import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { JobService } from 'src/app/core/services/job.service';
import { Category } from 'src/app/models/category.models';
import { Company } from 'src/app/models/company.model';
import { ExperienceLevel, Job, JobType, SalaryType, UpdateJobPayload } from 'src/app/models/job.model';

@Component({
  selector: 'app-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.scss']
})
export class EditJobComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  jobForm!: FormGroup;
  job: Job | null = null;
  currentUser!: any;
  companies: Company[] = [];
  categories: Category[] = []; // Add this

  jobTypes = Object.values(JobType);
  experienceLevels = Object.values(ExperienceLevel);
  salaryTypes = Object.values(SalaryType);

  loading = false;
  updating = false;
  submitted = false;
  success = false;

  newSkill = '';

  skillSuggestions = [
    'JavaScript', 'Angular', 'React', 'Vue.js', 'Node.js', 'Java',
    'Spring Boot', 'Python', 'Django', 'SQL', 'MongoDB', 'AWS',
    'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'REST API'
  ];

  tips = [
    {
      icon: 'fa-bullhorn',
      iconColor: 'text-info',
      title: 'Clear Job Title',
      description: 'Be specific about the role and level'
    },
    {
      icon: 'fa-dollar-sign',
      iconColor: 'text-success',
      title: 'Include Salary',
      description: 'Jobs with salary get more applications'
    },
    {
      icon: 'fa-list-check',
      iconColor: 'text-primary',
      title: 'List Key Skills',
      description: 'Mention specific technologies required'
    },
    {
      icon: 'fa-clock',
      iconColor: 'text-warning',
      title: 'Set Deadline',
      description: 'Give candidates time to apply'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private companyService: CompanyService,
    private categoryService: CategoryService, // Add this
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSnapshot();

    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.jobForm = this.buildForm();
    this.loadCompanies();
    this.loadCategories(); // Load categories
    this.listenJobTypeChanges();
    this.loadJobData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadJobData(): void {
    const jobId = this.route.snapshot.params['id'];
    if (!jobId) {
      this.router.navigate(['/employer/manage-jobs']);
      return;
    }

    this.loading = true;
    this.jobService.get(+jobId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (job) => {
        this.job = job;
        this.populateForm(job);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading job:', err);
        this.router.navigate(['/employer/manage-jobs']);
        this.loading = false;
      }
    });
  }

  private populateForm(job: Job): void {
    // Convert postedAt string to Date for form if needed
    const deadline = job.deadline ? new Date(job.deadline).toISOString().substring(0, 10) : '';

    this.jobForm.patchValue({
      companyId: job.company?.id || null,
      categoryId: job.category?.id || null,
      title: job.title,
      description: job.description,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      salaryType: job.salaryType,
      location: job.location,
      remoteAllowed: job.remoteAllowed,
      deadline: deadline
    });

    // Clear existing skills and add job skills
    this.skills.clear();
    if (job.skills && job.skills.length > 0) {
      job.skills.forEach(skill => {
        this.skills.push(this.fb.control(skill));
      });
    }
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      companyId: [null, Validators.required],
      categoryId: [null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(50)]],
      jobType: [JobType.FULL_TIME, Validators.required],
      experienceLevel: [ExperienceLevel.MID, Validators.required],
      minSalary: [null],
      maxSalary: [null],
      salaryType: [SalaryType.YEARLY],
      location: ['', Validators.required],
      remoteAllowed: [false],
      skills: this.fb.array([], Validators.required),
      deadline: ['', Validators.required]
    });
  }

  private loadCompanies(): void {
    this.companyService.getCompaniesByOwner(this.currentUser.id, { page: 0, size: 20 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.companies = res?.items || [];
        },
        error: (err) => {
          console.error('Error loading companies:', err);
          this.companies = [];
        }
      });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          this.categories = [];
        }
      });
  }

  private listenJobTypeChanges(): void {
    this.jobForm.get('jobType')!
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        if (type === JobType.FREELANCE || type === JobType.CONTRACT) {
          this.jobForm.patchValue({ salaryType: SalaryType.HOURLY });
        }
      });
  }

  // Skills handling
  get skills(): FormArray {
    return this.jobForm.get('skills') as FormArray;
  }

  addSkill(skill?: string): void {
    const value = (skill ?? this.newSkill).trim();
    if (!value || this.skills.value.includes(value)) return;

    this.skills.push(this.fb.control(value));
    this.newSkill = '';
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  onSkillKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  // Form submission
  onSubmit(): void {
    this.submitted = true;

    if (this.jobForm.invalid || !this.validateSalary() || !this.job?.id || !this.currentUser?.id) {
      return;
    }

    const payload: UpdateJobPayload = {
      title: this.jobForm.value.title,
      description: this.jobForm.value.description,
      categoryId: this.jobForm.value.categoryId,
      jobType: this.jobForm.value.jobType,
      experienceLevel: this.jobForm.value.experienceLevel,
      minSalary: this.jobForm.value.minSalary,
      maxSalary: this.jobForm.value.maxSalary,
      salaryType: this.jobForm.value.salaryType,
      location: this.jobForm.value.location,
      remoteAllowed: this.jobForm.value.remoteAllowed,
      skills: this.jobForm.value.skills,
      deadline: this.jobForm.value.deadline
      // Note: You might want to add status if you allow changing it
    };

    this.updating = true;

    this.jobService.update(this.job.id, this.currentUser.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedJob) => {
          this.success = true;
          this.updating = false;
          setTimeout(() => {
            this.router.navigate(['/employer/manage-jobs']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error updating job:', err);
          this.updating = false;
          alert('Failed to update job. Please try again.');
        }
      });
  }

  saveAsDraft(): void {
    console.log('Save as draft clicked');
    alert('Draft functionality not implemented yet');
  }

  private validateSalary(): boolean {
    const min = this.jobForm.value.minSalary;
    const max = this.jobForm.value.maxSalary;
    return !min || !max || min <= max;
  }

  get f() {
    return this.jobForm.controls;
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/employer/manage-jobs']);
  }
}