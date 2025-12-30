import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  // Form
  forgotPasswordForm: FormGroup;
  
  // State
  loading = false;
  submitted = false;
  emailSent = false;
  errorMessage = '';
  successMessage = '';
  resendCountdown = 0;
  
  // Destroy subject
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check for email from state (coming from login)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['email']) {
      this.forgotPasswordForm.patchValue({
        email: navigation.extras.state['email']
      });
    }

    // Check localStorage for remembered email
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      this.forgotPasswordForm.patchValue({ email: rememberedEmail });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clear any intervals
    if (this.resendCountdown > 0) {
      clearInterval((this as any).countdownInterval);
    }
  }

  // Form getter
  get f() {
    return this.forgotPasswordForm.controls;
  }

  // Submit form
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      return;
    }

    this.loading = true;
    const email = this.forgotPasswordForm.value.email.trim().toLowerCase();

    // Simulate API call (replace with actual API call)
    setTimeout(() => {
      this.loading = false;
      
      // Mock response - in real app, handle API response
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo
      
      if (isSuccess) {
        this.emailSent = true;
        this.successMessage = `Reset instructions sent to ${email}`;
        
        // Start resend countdown
        this.startResendCountdown();
        
        // Store email for auto-fill on reset page
        localStorage.setItem('password_reset_email', email);
      } else {
        this.errorMessage = 'Failed to send reset email. Please try again.';
      }
    }, 1500);

    // Real implementation would look like:
    // this.authService.forgotPassword({ email }).pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe({
    //   next: () => {
    //     this.emailSent = true;
    //     this.successMessage = `Reset instructions sent to ${email}`;
    //     this.startResendCountdown();
    //     localStorage.setItem('password_reset_email', email);
    //   },
    //   error: (error) => {
    //     this.handleError(error);
    //   }
    // });
  }

  // Handle API errors
  private handleError(error: any): void {
    this.loading = false;
    
    if (error.status === 404) {
      this.errorMessage = 'No account found with this email address.';
    } else if (error.status === 429) {
      this.errorMessage = 'Too many reset attempts. Please try again in 15 minutes.';
    } else if (error.status === 0) {
      this.errorMessage = 'Network error. Please check your connection.';
    } else {
      this.errorMessage = error.error?.message || 'Failed to send reset email. Please try again.';
    }
  }

  // Resend email
  resendEmail(): void {
    if (this.resendCountdown > 0) return;
    
    this.onSubmit();
  }

  // Start countdown timer for resend
  private startResendCountdown(): void {
    this.resendCountdown = 60; // 60 seconds
    
    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    (this as any).countdownInterval = interval;
  }

  // Reset form
  resetForm(): void {
    this.emailSent = false;
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.forgotPasswordForm.reset();
  }

  // Navigation
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
