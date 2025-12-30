import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { CompanyReview } from 'src/app/models/company-review.model';
import { Company } from 'src/app/models/company.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  company: Company | null = null;
  reviews: CompanyReview[] = [];
  loading = true;
  currentPage = 1;
  itemsPerPage = 10;
  totalReviews = 0;
  showReviewForm = false;
  reviewForm: FormGroup;
  currentUser: User | null = null;
  averageRating = 0;
  ratingDistribution: { rating: number, count: number, percentage: number }[] = [];
  submittingReview = false;
  hasUserReviewed = false;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const companyId = params['id'];
      if (companyId) {
        this.loadCompanyDetails(companyId);
        this.loadReviews(companyId);
      }
    });

    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;
      this.checkIfUserHasReviewed();
    });
  }

  loadCompanyDetails(companyId: number): void {
    this.companyService.get(companyId).subscribe({
      next: (company) => {
        this.company = company;
      },
      error: (error) => {
        console.error('Error loading company:', error);
      }
    });
  }

  loadReviews(companyId: number): void {
    this.loading = true;
    const query = {
      page: this.currentPage - 1,
      size: this.itemsPerPage
    };

    this.companyService.listReviews(companyId, query).subscribe({
      next: (response: any) => {
        this.reviews = response.items || [];
        this.totalReviews = response.totalItems || 0;
        this.calculateStats();
        this.checkIfUserHasReviewed();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      this.ratingDistribution = this.initializeRatingDistribution();
      return;
    }

    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / this.reviews.length;

    this.ratingDistribution = this.initializeRatingDistribution();
    this.reviews.forEach(review => {
      this.ratingDistribution[5 - review.rating].count++;
    });

    this.ratingDistribution.forEach(item => {
      item.percentage = (item.count / this.reviews.length) * 100;
    });
  }

  initializeRatingDistribution(): { rating: number, count: number, percentage: number }[] {
    return Array.from({ length: 5 }, (_, i) => ({
      rating: 5 - i,
      count: 0,
      percentage: 0
    }));
  }

  checkIfUserHasReviewed(): void {
    if (!this.currentUser || this.reviews.length === 0) {
      this.hasUserReviewed = false;
      return;
    }
    
    this.hasUserReviewed = this.reviews.some(review => review.reviewerId === this.currentUser?.id);
  }

  onPageChange(page: number | string): void {
  if (typeof page === 'number') {
    this.currentPage = page;
    if (this.company?.id) {
      this.loadReviews(this.company.id);
    }
    window.scrollTo(0, 0);
  }
}

  submitReview(): void {
  if (this.reviewForm.invalid || !this.company?.id || !this.currentUser) {
    return;
  }

  this.submittingReview = true;
  const reviewData = {
    rating: this.reviewForm.value.rating,
    title: this.reviewForm.value.title,
    comment: this.reviewForm.value.comment
  };

  // Now call the correct method
  this.companyService.addReview(this.company.id, reviewData, this.currentUser.id).subscribe({
    next: () => {
      alert('Review submitted successfully!');
      this.reviewForm.reset({ rating: 5 });
      this.showReviewForm = false;
      this.submittingReview = false;
      this.hasUserReviewed = true;
      
      if (this.company?.id) {
        this.loadReviews(this.company.id);
      }
    },
    error: (error) => {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
      this.submittingReview = false;
    }
  });
}

  getStarIcons(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) stars.push('bi-star-fill');
    if (hasHalfStar) stars.push('bi-star-half');
    while (stars.length < 5) stars.push('bi-star');
    
    return stars;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffMs = now.getTime() - reviewDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  getReviewerInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleReviewForm(): void {
    if (!this.currentUser) {
      alert('Please login to submit a review');
      return;
    }
    
    if (this.hasUserReviewed) {
      alert('You have already reviewed this company');
      return;
    }
    
    this.showReviewForm = !this.showReviewForm;
  }

  getRatingText(rating: number): string {
    const texts = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Terrible'
    };
    return texts[rating as keyof typeof texts] || 'Good';
  }
  getPageNumbers(): (number | string)[] {
  const totalPages = Math.ceil(this.totalReviews / this.itemsPerPage);
  const pages: (number | string)[] = [];
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    
    if (this.currentPage > 3) pages.push('...');
    
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(totalPages - 1, this.currentPage + 1);
    
    for (let i = start; i <= end; i++) pages.push(i);
    
    if (this.currentPage < totalPages - 2) pages.push('...');
    
    if (totalPages > 1) pages.push(totalPages);
  }
  
  return pages;
}
}
