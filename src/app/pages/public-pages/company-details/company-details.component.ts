import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from 'src/app/core/services/company.service';
import { JobService } from 'src/app/core/services/job.service';
import { UserService } from 'src/app/core/services/user.service';
import { CompanyReview } from 'src/app/models/company-review.model';
import { Company } from 'src/app/models/company.model';
import { Job } from 'src/app/models/job.model';
import { Pagination } from 'src/app/models/pagination.model';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {

  company: Company | null = null;
  jobs: Job[] = [];
  reviews: CompanyReview[] = [];
  similarCompanies: Company[] = [];
  reviewerNames = new Map<number, string>();
  loading = true;
  activeTab: string = 'overview';

  averageRating = 0;
  totalReviews = 0;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private jobService: JobService,
    private userService: UserService

  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const companyId = Number(params['id']);
      if (companyId) {
        this.loadCompanyDetails(companyId);
        this.loadCompanyJobs(companyId);
        // this.loadCompanyReviews(companyId);
      }
    });
  }

  // -----------------------
  // Company Details
  // -----------------------
  loadCompanyDetails(companyId: number): void {
    this.companyService.get(companyId).subscribe({
      next: (company: Company) => {
        this.company = company;
        this.loading = false;
        this.loadSimilarCompanies(company.industry);
      },
      error: (error) => {
        console.error('Error loading company:', error);
        this.loading = false;
      }
    });
  }

  // -----------------------
  // Company Jobs
  // -----------------------
 loadCompanyJobs(companyId: number): void {
    this.loading = true;
    
    // Option 1: If you added listByCompany to JobService
    this.jobService.listByCompany(companyId, { size: 5 }).subscribe({
      next: (response) => {
        this.jobs = response.items;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading company jobs:', error);
        this.loading = false;
      }
    });
    
    
  }

  // -----------------------
  // Company Reviews ✅ FIXED
  // -----------------------

loadCompanyReviews(companyId: number): void {
  this.companyService.listReviews(companyId, { size: 5 }).subscribe({
    next: (response: Pagination<CompanyReview>) => {
      this.reviews = response.items;
      this.totalReviews = response.totalItems;
      this.calculateRatingStats();
      
      // Fetch reviewer names for each review
      this.reviews.forEach((review, index) => {
        this.fetchReviewerName(review.reviewerId, index);
      });
    },
    error: (error) => {
      console.error('Error loading company reviews:', error);
    }
  });
}

fetchReviewerName(userId: number, index: number): void {
  this.userService.getUser(userId).subscribe({
    next: (user) => {
      this.reviewerNames.set(userId, user.fullName);
    },
    error: () => {
      this.reviewerNames.set(userId, 'Anonymous User');
    }
  });
}



getReviewerName(reviewerId: number): string {
  return this.reviewerNames.get(reviewerId) ?? 'Loading...';
}


// Update getReviewerInitials to use the reviewerId
getReviewerInitials(reviewerId: number): string {
  const name = this.getReviewerName(reviewerId);
  return this.getInitials(name);
}

  // -----------------------
  // Similar Companies
  // -----------------------
  loadSimilarCompanies(industry?: string): void {
    if (!industry) return;

    this.companyService.list({ industry, size: 4 }).subscribe({
      next: (response: Pagination<Company>) => {
        this.similarCompanies = response.items
          .filter(c => c.id !== this.company?.id)
          .slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading similar companies:', error);
      }
    });
  }

  // -----------------------
  // Rating Stats
  // -----------------------
  calculateRatingStats(): void {
    if (!this.reviews.length) {
      this.averageRating = 0;
      return;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    this.averageRating = Number(
      (total / this.reviews.length).toFixed(1)
    );
  }

  getRatingDistribution(): {
    rating: number;
    count: number;
    percentage: number;
  }[] {
    const distribution = Array.from({ length: 5 }, (_, i) => ({
      rating: 5 - i,
      count: 0,
      percentage: 0
    }));

    this.reviews.forEach(review => {
      const index = 5 - review.rating;
      if (distribution[index]) {
        distribution[index].count++;
      }
    });

    distribution.forEach(item => {
      item.percentage = this.totalReviews
        ? (item.count / this.totalReviews) * 100
        : 0;
    });

    return distribution;
  }

  // -----------------------
  // UI Helpers
  // -----------------------
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getIndustryIcon(industry: string): string {
    const icons: Record<string, string> = {
      Technology: 'bi-cpu',
      Healthcare: 'bi-heart-pulse',
      Finance: 'bi-cash-coin',
      Retail: 'bi-shop',
      Manufacturing: 'bi-gear',
      Education: 'bi-mortarboard',
      'Real Estate': 'bi-house',
      Transportation: 'bi-truck',
      Media: 'bi-camera-video',
      Energy: 'bi-lightning'
    };
    return icons[industry] || 'bi-building';
  }

  followCompany(): void {
    console.log('Following company:', this.company?.name);
  }

  getRatingStars(rating: number): string[] {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('bi-star-fill');
  }
  
  if (hasHalfStar) {
    stars.push('bi-star-half');
  }
  
  while (stars.length < 5) {
    stars.push('bi-star');
  }
  
  return stars;
}

getSocialLinkIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'WEBSITE': 'bi-globe',
    'LINKEDIN': 'bi-linkedin',
    'FACEBOOK': 'bi-facebook',
    'TWITTER': 'bi-twitter',
    'INSTAGRAM': 'bi-instagram'
  };
  return icons[type] || 'bi-link';
}

  getDaysAgo(date: string | Date): string {
    if (!date) return 'Recently';
    
    const postedDate = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(postedDate.getTime())) {
      return 'Recently';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

getTimeAgo(date: Date): string {
  return this.getDaysAgo(date);
}

getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
}
