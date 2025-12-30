import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoginRequest } from 'src/app/models/login-request.model';
import { LoginResponse } from 'src/app/models/login-response.model';
import { UserRole } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  submitted = false;
  showPassword = false;
  returnUrl: string = '/';
  
  // Demo accounts for development
  readonly userTypes = [
    { role: UserRole.JOB_SEEKER, email: 'demo.jobseeker@example.com', password: 'demo123', label: 'Job Seeker' },
    { role: UserRole.EMPLOYER, email: 'demo.employer@example.com', password: 'demo123', label: 'Employer' },
    { role: UserRole.ADMIN, email: 'admin@example.com', password: 'admin123', label: 'Admin' }
  ];
  isDevelopment = !environment.production;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    const user = this.authService.getCurrentUserSnapshot();
   if (user && user.role) {
    this.redirectBasedOnRole(user.role);
  }

    const registrationEmail = localStorage.getItem('registration_email');
    if (registrationEmail) {
      this.loginForm.patchValue({ email: registrationEmail });
      localStorage.removeItem('registration_email');
    }

    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail, rememberMe: true });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get emailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get rememberMeControl(): FormControl {
    return this.loginForm.get('rememberMe') as FormControl;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    const loginRequest: LoginRequest = {
      email: this.emailControl.value!.trim().toLowerCase(),
      password: this.passwordControl.value!
    };

    this.authService.login(loginRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: LoginResponse) => {
          this.loading = false;
          this.submitted = false;

          if (this.rememberMeControl.value) {
            localStorage.setItem('remembered_email', loginRequest.email);
          } else {
            localStorage.removeItem('remembered_email');
          }

          // Save currentUser properly in AuthService is already handled
          this.router.navigate([this.getRedirectPath(response.user.role!)]);
        },
        error: (error) => {
          this.loading = false;
          this.handleLoginError(error);
        }
      });
  }

  demoLogin(userType: any): void {
    if (!this.isDevelopment) return;
    this.loginForm.patchValue({ email: userType.email, password: userType.password });
    this.onSubmit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password'], { state: { email: this.emailControl.value } });
  }

  private handleLoginError(error: any): void {
    if (error.status === 401) this.errorMessage = 'Invalid email or password.';
    else if (error.status === 403) this.errorMessage = 'Account is inactive.';
    else if (error.status === 429) this.errorMessage = 'Too many login attempts.';
    else if (error.status === 0) this.errorMessage = 'Network error.';
    else this.errorMessage = error.error?.message || 'Login failed.';

    this.passwordControl.reset();
  }

  private getRedirectPath(role: UserRole): string {
    if (this.returnUrl && this.returnUrl !== '/dashboard') return this.returnUrl;
    switch (role) {
      case UserRole.ADMIN: return '/admin/dashboard';
      case UserRole.EMPLOYER: return '/employer/dashboard';
      case UserRole.JOB_SEEKER: return '/job-seeker/dashboard';
      default: return '/dashboard';
    }
  }

  private redirectBasedOnRole(role: UserRole): void {
    this.router.navigate([this.getRedirectPath(role)]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }
}