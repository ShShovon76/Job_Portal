import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { JobService } from 'src/app/core/services/job.service';
import { Company } from 'src/app/models/company.model';
import { JobCategory } from 'src/app/models/job-category.model';
import { CreateJobPayload, ExperienceLevel, JobType, SalaryType } from 'src/app/models/job.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.scss']
})
export class PostJobComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  jobForm!: FormGroup;
  currentUser!: User | null;
  companies: Company[] = [];
  categories: JobCategory[] = []; // Use JobCategory type

  jobTypes = Object.values(JobType);
  experienceLevels = Object.values(ExperienceLevel);
  salaryTypes = Object.values(SalaryType);

  loading = false;
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
    private authService: AuthService,
    private categoryService: CategoryService, // This should work now
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSnapshot();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.initForm();
    this.loadCompanies();
    this.loadCategories();
    this.listenToJobTypeChanges();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getEmployerId(): number | null {
    const token = this.authService.getAccessToken();
    if (!token) return null;

    try {
      const payload: any = jwt_decode(token);
      return payload.userId ?? null; // Use the userId from JWT
    } catch (e) {
      console.error('Invalid JWT token', e);
      return null;
    }
  }

  /* =========================
     FORM INITIALIZATION
     ========================= */

  private initForm(): void {
    const today = new Date();
    const deadline = new Date();
    deadline.setDate(today.getDate() + 30);

    this.jobForm = this.fb.group({
      companyId: [null, Validators.required],
      categoryId: [null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(100)]],
      jobType: [JobType.FULL_TIME, Validators.required],
      experienceLevel: [ExperienceLevel.MID, Validators.required],
      minSalary: [null, Validators.min(0)],
      maxSalary: [null, Validators.min(0)],
      salaryType: [SalaryType.YEARLY, Validators.required],
      location: ['', [Validators.required, Validators.maxLength(100)]],
      remoteAllowed: [false],
      skills: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      deadline: [deadline.toISOString().substring(0, 10), Validators.required]
    });

    // Add some default skills
    this.addSkill('Communication');
    this.addSkill('Problem Solving');
  }

  private listenToJobTypeChanges(): void {
    this.jobForm.get('jobType')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: JobType) => {
        if (type === JobType.FREELANCE || type === JobType.CONTRACT) {
          this.jobForm.patchValue({ salaryType: SalaryType.HOURLY });
        }
      });
  }

  /* =========================
     SKILLS MANAGEMENT
     ========================= */

  get skills(): FormArray {
    return this.jobForm.get('skills') as FormArray;
  }

  addSkill(skill?: string): void {
    const value = (skill ?? this.newSkill).trim();
    
    if (!value) {
      return;
    }
    
    // Check if skill already exists (case-insensitive)
    const existingSkills = this.skills.value.map((s: string) => s.toLowerCase());
    if (existingSkills.includes(value.toLowerCase())) {
      this.newSkill = '';
      return;
    }
    
    this.skills.push(new FormControl(value));
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

  /* =========================
     DATA LOADING
     ========================= */

 private loadCompanies(): void {
  if (!this.currentUser) return;

  this.companyService.getCompaniesByOwner(this.currentUser.id, { page: 0, size: 20 })
    .pipe(
      takeUntil(this.destroy$),
      catchError((error: HttpErrorResponse) => {
        console.error('Error loading companies:', error);
        
        // If it's a 401 error, the interceptor should handle it
        if (error.status === 401) {
          // Show user-friendly message
          alert('Your session has expired. Please login again.');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        
        this.companies = [];
        return of({ items: [], totalItems: 0, page: 0, size: 0, totalPages: 0 });
      })
    )
    .subscribe({
      next: (response) => {
        this.companies = response.items || [];
        
        // Auto-select company if only one exists
        if (this.companies.length === 1) {
          this.jobForm.patchValue({ companyId: this.companies[0].id });
        }
      }
    });
}

  private loadCategories(): void {
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: JobCategory[]) => { // Add type annotation
          this.categories = categories;
          
          // Auto-select first category if exists
          if (this.categories.length > 0 && !this.jobForm.get('categoryId')?.value) {
            this.jobForm.patchValue({ categoryId: this.categories[0].id });
          }
        },
        error: (error: any) => { // Add type annotation
          console.error('Error loading categories:', error);
          this.categories = [];
        }
      });
  }

  /* =========================
     FORM VALIDATION & SUBMISSION
     ========================= */

  validateSalary(): boolean {
    const minSalary = this.jobForm.get('minSalary')?.value;
    const maxSalary = this.jobForm.get('maxSalary')?.value;
    
    // If both are provided, min should be less than or equal to max
    if (minSalary !== null && maxSalary !== null) {
      return minSalary <= maxSalary;
    }
    
    // If only one is provided, that's fine
    return true;
  }

  validateDeadline(): boolean {
    const deadlineStr = this.jobForm.get('deadline')?.value;
    if (!deadlineStr) return false;
    
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return deadline >= today;
  }

  getFormErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.validateSalary()) {
      errors.push('Minimum salary must be less than or equal to maximum salary.');
    }
    
    if (!this.validateDeadline()) {
      errors.push('Deadline must be today or in the future.');
    }
    
    if (this.skills.length === 0) {
      errors.push('Please add at least one skill.');
    }
    
    return errors;
  }

  onSubmit(): void {
    this.submitted = true;
    
    // Check for custom validations
    const formErrors = this.getFormErrors();
    if (formErrors.length > 0) {
      // Show errors to user (you can implement a toast or alert)
      alert(formErrors.join('\n'));
      return;
    }
    
    // Check if form is valid
    if (this.jobForm.invalid) {
      this.markAllAsTouched();
      return;
    }
    
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loading = true;
    
    const formValue = this.jobForm.value;
    const payload: CreateJobPayload = {
      companyId: formValue.companyId,
      categoryId: formValue.categoryId,
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      jobType: formValue.jobType,
      experienceLevel: formValue.experienceLevel,
      minSalary: formValue.minSalary ? Number(formValue.minSalary) : undefined,
      maxSalary: formValue.maxSalary ? Number(formValue.maxSalary) : undefined,
      salaryType: formValue.salaryType,
      location: formValue.location.trim(),
      remoteAllowed: formValue.remoteAllowed,
      skills: formValue.skills.map((skill: string) => skill.trim()),
      deadline: formValue.deadline
    };
    
    this.jobService.create(this.currentUser.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdJob) => {
          this.success = true;
          this.loading = false;
          
          // Show success message and redirect
          setTimeout(() => {
            this.router.navigate(['/employer/manage-jobs'], {
              queryParams: { created: true, jobId: createdJob.id }
            });
          }, 1500);
        },
        error: (error: any) => {
          console.error('Error creating job:', error);
          this.loading = false;
          
          // Handle specific error cases
          if (error.status === 401) {
            alert('Your session has expired. Please login again.');
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else if (error.status === 403) {
            alert('You are not authorized to create jobs for this company.');
          } else if (error.status === 404) {
            alert('Company or category not found. Please check your selection.');
          } else {
            alert('Failed to create job. Please try again.');
          }
        }
      });
  }

  saveAsDraft(): void {
    if (!this.currentUser) return;
    
    const formData = this.jobForm.value;
    const draft = {
      ...formData,
      draftSavedAt: new Date().toISOString(),
      employerId: this.currentUser.id
    };
    
    // Save to localStorage (or implement a proper draft service)
    localStorage.setItem(`job_draft_${this.currentUser.id}`, JSON.stringify(draft));
    
    alert('Job saved as draft. You can continue later.');
  }

  loadDraft(): void {
    if (!this.currentUser) return;
    
    const draftData = localStorage.getItem(`job_draft_${this.currentUser.id}`);
    if (draftData) {
      const draft = JSON.parse(draftData);
      
      // Clear skills array first
      while (this.skills.length !== 0) {
        this.skills.removeAt(0);
      }
      
      // Patch form values
      this.jobForm.patchValue({
        companyId: draft.companyId,
        categoryId: draft.categoryId,
        title: draft.title,
        description: draft.description,
        jobType: draft.jobType,
        experienceLevel: draft.experienceLevel,
        minSalary: draft.minSalary,
        maxSalary: draft.maxSalary,
        salaryType: draft.salaryType,
        location: draft.location,
        remoteAllowed: draft.remoteAllowed,
        deadline: draft.deadline
      });
      
      // Add skills back
      if (draft.skills && Array.isArray(draft.skills)) {
        draft.skills.forEach((skill: string) => this.addSkill(skill));
      }
      
      alert('Draft loaded successfully!');
    } else {
      alert('No draft found.');
    }
  }

  /* =========================
     HELPER METHODS
     ========================= */

  private markAllAsTouched(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  get f() {
    return this.jobForm.controls;
  }

  get salaryError(): string {
    if (!this.validateSalary()) {
      return 'Min salary must be ≤ Max salary';
    }
    return '';
  }

  get deadlineError(): string {
    if (!this.validateDeadline()) {
      return 'Deadline must be in the future';
    }
    return '';
  }

  get skillsError(): string {
    if (this.skills.length === 0 && (this.submitted || this.skills.touched)) {
      return 'At least one skill is required';
    }
    return '';
  }

  // Helper getter for template
  get today(): Date {
    return new Date();
  }

  getCompletionPercentage(): number {
  let completedFields = 0;
  const requiredFields = ['companyId', 'categoryId', 'title', 'description', 'jobType', 'experienceLevel', 'location', 'deadline'];
  
  requiredFields.forEach(field => {
    if (this.jobForm.get(field)?.value) {
      completedFields++;
    }
  });
  
  // Check skills
  if (this.skills.length > 0) {
    completedFields++;
  }
  
  // Check salary (optional but recommended)
  if (this.jobForm.get('minSalary')?.value || this.jobForm.get('maxSalary')?.value) {
    completedFields++;
  }
  
  const totalFields = requiredFields.length + 2; // +2 for skills and salary
  return Math.round((completedFields / totalFields) * 100);
}

getCompletionChecks(): Array<{ label: string, completed: boolean }> {
  return [
    { label: 'Company selected', completed: !!this.jobForm.get('companyId')?.value },
    { label: 'Category selected', completed: !!this.jobForm.get('categoryId')?.value },
    { label: 'Job title filled', completed: !!this.jobForm.get('title')?.value },
    { label: 'Description written', completed: this.jobForm.get('description')?.value?.length >= 100 },
    { label: 'Job type selected', completed: !!this.jobForm.get('jobType')?.value },
    { label: 'Experience level selected', completed: !!this.jobForm.get('experienceLevel')?.value },
    { label: 'Location specified', completed: !!this.jobForm.get('location')?.value },
    { label: 'Skills added', completed: this.skills.length > 0 },
    { label: 'Salary information', completed: !!(this.jobForm.get('minSalary')?.value || this.jobForm.get('maxSalary')?.value) },
    { label: 'Deadline set', completed: !!this.jobForm.get('deadline')?.value }
  ];
}
}
function jwt_decode(token: string): any {
  throw new Error('Function not implemented.');
}

