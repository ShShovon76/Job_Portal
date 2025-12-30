import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { RegisterEmployerRequest } from 'src/app/models/register-employer-request.model';
import { RegisterJobSeekerRequest } from 'src/app/models/register-jobseeker-request.model';
import { UserRole } from 'src/app/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {
  // Role selection
  selectedRole: UserRole | null = null;
  UserRole = UserRole;
  
  // Forms with explicit types
  commonForm: FormGroup;
  
  employerForm: FormGroup;
  ;
  
  // State
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;
  
  // Destroy subject
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Common form for all users
    this.commonForm = this.formBuilder.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator()
    });

    // Additional form for employers
    this.employerForm = this.formBuilder.nonNullable.group({
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });

    // Watch password changes for strength meter
    this.commonForm.get('password')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Get form controls with proper typing
  get fullNameControl(): FormControl {
    return this.commonForm.get('fullName') as FormControl;
  }

  get emailControl(): FormControl {
    return this.commonForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.commonForm.get('password') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.commonForm.get('confirmPassword') as FormControl;
  }

  get agreeToTermsControl(): FormControl {
    return this.commonForm.get('agreeToTerms') as FormControl;
  }

  get companyNameControl(): FormControl {
    return this.employerForm.get('companyName') as FormControl;
  }

  // Role selection
  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = false;
  }

  goBack(): void {
    this.selectedRole = null;
    this.submitted = false;
    this.errorMessage = '';
  }

  // Form submission
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Validate common form
    if (this.commonForm.invalid) {
      this.markFormGroupTouched(this.commonForm);
      return;
    }

    // Validate employer form if employer is selected
    if (this.selectedRole === UserRole.EMPLOYER && this.employerForm.invalid) {
      this.markFormGroupTouched(this.employerForm);
      return;
    }

    this.loading = true;

    const commonData = this.commonForm.getRawValue();

    if (this.selectedRole === UserRole.JOB_SEEKER) {
      const payload: RegisterJobSeekerRequest = {
        fullName: commonData.fullName.trim(),
        email: commonData.email.trim().toLowerCase(),
        password: commonData.password
      };

      this.authService.registerJobSeeker(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.handleRegistrationSuccess(commonData.email);
          },
          error: (error) => {
            this.handleRegistrationError(error);
          }
        });
    } else if (this.selectedRole === UserRole.EMPLOYER) {
      const payload: RegisterEmployerRequest = {
        fullName: commonData.fullName.trim(),
        email: commonData.email.trim().toLowerCase(),
        password: commonData.password,
        companyName: this.employerForm.getRawValue().companyName.trim()
      };

      this.authService.registerEmployer(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.handleRegistrationSuccess(commonData.email);
          },
          error: (error) => {
            this.handleRegistrationError(error);
          }
        });
    }
  }

  // Handle successful registration
  private handleRegistrationSuccess(email: string): void {
    this.loading = false;
    this.successMessage = 'Registration successful! Redirecting to login...';
    
    // Save email for auto-fill on login
    localStorage.setItem('registration_email', email);
    
    // Redirect to login after delay
    setTimeout(() => {
      this.router.navigate(['/auth/login'], {
        queryParams: { registered: true }
      });
    }, 2000);
  }

  // Handle registration errors
  private handleRegistrationError(error: any): void {
    this.loading = false;
    
    if (error.status === 409) {
      this.errorMessage = 'Email already exists. Please use a different email or login.';
    } else if (error.status === 400) {
      if (error.error?.errors) {
        // Handle validation errors
        const errors = error.error.errors;
        this.errorMessage = Object.values(errors).join(', ');
      } else {
        this.errorMessage = 'Invalid registration data. Please check your inputs.';
      }
    } else if (error.status === 422) {
      this.errorMessage = 'Please complete all required fields correctly.';
    } else if (error.status === 0) {
      this.errorMessage = 'Network error. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
    }
  }

  // Custom validators
  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  // Update password strength meter
  private updatePasswordStrength(): void {
    const password = this.passwordControl.value;
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    this.passwordStrength = Math.min(strength, 100);
  }

  // Password visibility toggle
  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  // Navigation
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Get strength meter class
  getStrengthClass(): string {
    if (this.passwordStrength < 40) return 'bg-danger';
    if (this.passwordStrength < 70) return 'bg-warning';
    return 'bg-success';
  }
}

