import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  loading = false;
  success = false;
  errorMessage = '';
  token: string | null = null;
  email: string | null = null;
  
  resetPasswordForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Get token and email from query params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.token = params['token'];
        this.email = params['email'];
        
        if (!this.token || !this.email) {
          this.errorMessage = 'Invalid or expired reset link.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token || !this.email) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const payload = {
      token: this.token,
      email: this.email,
      newPassword: this.resetPasswordForm.value.password
    };

    // TODO: Implement API call to reset password
    // this.authService.resetPassword(payload).pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe({
    //   next: () => {
    //     this.loading = false;
    //     this.success = true;
    //   },
    //   error: (error) => {
    //     this.loading = false;
    //     this.handleError(error);
    //   }
    // });

    // Simulating API call
    setTimeout(() => {
      this.loading = false;
      this.success = true;
    }, 1500);
  }

  private handleError(error: any): void {
    if (error.status === 400) {
      this.errorMessage = 'Invalid or expired reset token.';
    } else if (error.status === 0) {
      this.errorMessage = 'Network error. Please check your connection.';
    } else {
      this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
    }
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  hasUppercase(): boolean {
  return /[A-Z]/.test(this.resetPasswordForm.value.password || '');
}

hasLowercase(): boolean {
  return /[a-z]/.test(this.resetPasswordForm.value.password || '');
}

hasNumber(): boolean {
  return /\d/.test(this.resetPasswordForm.value.password || '');
}
}
