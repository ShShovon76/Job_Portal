import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { User, UserRole } from 'src/app/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mobileMenu') mobileMenu!: ElementRef;
  
  // User state
  currentUser: User | null = null;
  isAuthenticated = false;
  
  // UI state
  isMobileMenuOpen = false;
  isProfileDropdownOpen = false;
  isScrolled = false;
  activeRoute = '';
  
  // Role-based navigation
  readonly userRole = UserRole;
  
  // Unsubscribe subject
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Subscribe to user authentication state
    this.authService.getCurrentUser$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
      });

    // Track active route for highlighting
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.activeRoute = event.urlAfterRedirects;
        this.isMobileMenuOpen = false; // Close mobile menu on navigation
        this.isProfileDropdownOpen = false;
      });

    // Initialize scroll state
    this.onWindowScroll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMobileMenuOpen = false;
      this.isProfileDropdownOpen = false;
    }
  }

  // Navigation methods
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToDashboard(): void {
  if (!this.currentUser || !this.currentUser.role) {
    this.router.navigate(['/dashboard']);
    return;
  }
  
  const routes = {
    [UserRole.ADMIN]: '/admin/dashboard',
    [UserRole.EMPLOYER]: '/employer/dashboard',
    [UserRole.JOB_SEEKER]: '/job-seeker/dashboard'
  };
  
  // Now TypeScript knows role is defined here
  this.router.navigate([routes[this.currentUser.role] || '/dashboard']);
}

  navigateToProfile(): void {
  if (!this.currentUser || !this.currentUser.role) {
    // Default to job seeker profile if user role is not available
    this.router.navigate(['/job-seeker/profile']);
    return;
  }
  
  // Close dropdown before navigation
  this.isProfileDropdownOpen = false;
  
  // Route based on user role
  const profileRoutes = {
    [UserRole.ADMIN]: '/admin/profile', // If you have admin profile
    [UserRole.EMPLOYER]: '/employer/company-profile', // Employer goes to company profile
    [UserRole.JOB_SEEKER]: '/job-seeker/profile' // Job seeker goes to personal profile
  };
  
  const targetRoute = profileRoutes[this.currentUser.role];
  
  if (targetRoute) {
    this.router.navigate([targetRoute]);
  } else {
    // Fallback to job seeker profile
    this.router.navigate(['/job-seeker/profile']);
  }
}

  navigateToJobs(): void {
    this.router.navigate(['/jobs']);
  }

  navigateToCompanies(): void {
    this.router.navigate(['/companies']);
  }

  navigateToPostJob(): void {
    this.router.navigate(['/employer/post-job']);  // Correct path
  }

  navigateToAppliedJobs(): void {
    this.router.navigate(['/job-seeker/applied-jobs']);  // Fixed path
  }

  navigateToSavedJobs(): void {
    this.router.navigate(['/job-seeker/saved-jobs']);  // Fixed path
  }

  navigateToAdminPanel(): void {
    this.router.navigate(['/admin/dashboard']);  // Correct path
  }

  // Auth methods
  login(): void {
    this.router.navigate(['/auth/login']);
  }

  register(): void {
    this.router.navigate(['/auth/register']);
  }

  logout(): void {
  this.authService.logout().subscribe(() => {
    this.router.navigate(['/']);
    this.isProfileDropdownOpen = false;
  });
}

  // UI methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isProfileDropdownOpen = false;
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    this.isMobileMenuOpen = false;
  }

  closeAllDropdowns(): void {
    this.isMobileMenuOpen = false;
    this.isProfileDropdownOpen = false;
  }

  // Get user initials for avatar
  getUserInitials(): string {
    if (!this.currentUser?.fullName) return 'U';
    return this.currentUser.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Check if route is active for highlighting
  isRouteActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }

  // Check user role
  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  isEmployer(): boolean {
    return this.currentUser?.role === UserRole.EMPLOYER;
  }

  isJobSeeker(): boolean {
    return this.currentUser?.role === UserRole.JOB_SEEKER;
  }
}