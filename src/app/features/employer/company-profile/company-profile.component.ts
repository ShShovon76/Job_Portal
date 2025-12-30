import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { CompanyReview } from 'src/app/models/company-review.model';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  company: Company | null = null;
  reviews: CompanyReview[] = [];
  currentUser: User | null = null;
  
  loading = true;
  loadingReviews = true;
  
  // Stats
  stats = {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    averageRating: 0
  };
  
  // Rating breakdown
  ratingBreakdown = [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 }
  ];

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSnapshot();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadCompany();
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCompany(): void {
    // Load first company owned by user
    this.companyService.getCompaniesByOwner(this.currentUser!.id, { page: 0, size: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.items.length > 0) {
            this.company = response.items[0];
            this.loadCompanyDetails(this.company.id);
          } else {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Failed to load company:', error);
          this.loading = false;
        }
      });
  }

  private loadCompanyDetails(companyId: number): void {
    this.companyService.get(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (company) => {
          this.company = company;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load company details:', error);
          this.loading = false;
        }
      });
  }

  private loadReviews(): void {
    if (!this.company?.id) return;
    
    this.companyService.listReviews(this.company.id, { page: 0, size: 5 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.reviews = response.items || [];
          this.calculateRatingBreakdown();
          this.loadingReviews = false;
        },
        error: (error) => {
          console.error('Failed to load reviews:', error);
          this.loadingReviews = false;
        }
      });
  }

  private calculateRatingBreakdown(): void {
    if (!this.reviews.length) return;
    
    const totalReviews = this.reviews.length;
    this.ratingBreakdown.forEach(rating => {
      rating.count = this.reviews.filter(r => Math.round(r.rating) === rating.stars).length;
      rating.percentage = Math.round((rating.count / totalReviews) * 100);
    });
    
    this.stats.averageRating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  }

  editProfile(): void {
    this.router.navigate(['/employer/company-profile/edit']);
  }

  getIndustryIcon(industry: string): string {
    const icons: { [key: string]: string } = {
      'Technology': 'fas fa-laptop-code',
      'Finance': 'fas fa-chart-line',
      'Healthcare': 'fas fa-heartbeat',
      'Education': 'fas fa-graduation-cap',
      'Retail': 'fas fa-shopping-cart',
      'Manufacturing': 'fas fa-industry',
      'Hospitality': 'fas fa-concierge-bell',
      'Construction': 'fas fa-hard-hat'
    };
    return icons[industry] || 'fas fa-building';
  }

  getCompanySizeLabel(size: string | undefined): string {
    if (!size) return 'Not specified';
    
    const labels: { [key: string]: string } = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '501-1000': '501-1000 employees',
      '1000+': '1000+ employees'
    };
    return labels[size] || size;
  }

  formatWebsite(url: string): string {
    if (!url) return '';
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  }

  // Add these missing methods:
  
  // Social icon helper methods
  getSocialIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'WEBSITE': 'fa-globe',
      'LINKEDIN': 'fa-linkedin',
      'FACEBOOK': 'fa-facebook',
      'TWITTER': 'fa-twitter',
      'INSTAGRAM': 'fa-instagram'
    };
    return iconMap[type] || 'fa-link';
  }

  getSocialIconClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'LINKEDIN': 'text-primary',
      'FACEBOOK': 'text-primary',
      'TWITTER': 'text-info',
      'INSTAGRAM': 'text-danger',
      'WEBSITE': 'text-secondary'
    };
    return classMap[type] || 'text-muted';
  }

  getSocialLabel(type: string): string {
    const labelMap: { [key: string]: string } = {
      'WEBSITE': 'Website',
      'LINKEDIN': 'LinkedIn',
      'FACEBOOK': 'Facebook',
      'TWITTER': 'Twitter',
      'INSTAGRAM': 'Instagram'
    };
    return labelMap[type] || type;
  }
  
  // Helper method to safely round ratings
  getRoundedAverageRating(): number {
    return Math.round(this.stats.averageRating);
  }
}
