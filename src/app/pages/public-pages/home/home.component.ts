import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/core/services/category.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { JobService } from 'src/app/core/services/job.service';
import { Category } from 'src/app/models/category.models';
import { Company } from 'src/app/models/company.model';
import { ExperienceLevel, Job, JobType } from 'src/app/models/job.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;
  loading = false;
  
  // Quick Links Stats
  quickLinks = [
    { label: 'Employer List', count: 3124, icon: 'bi-buildings', color: 'bg-primary' },
    { label: 'New Jobs', count: 223, icon: 'bi-briefcase', color: 'bg-success' },
    { label: 'Deadline Tomorrow', count: 558, icon: 'bi-clock', color: 'bg-danger' },
    { label: 'Internship Opportunity', count: 71, icon: 'bi-mortarboard', color: 'bg-info' },
    { label: 'Contractual Jobs', count: 169, icon: 'bi-file-earmark-text', color: 'bg-warning' },
    { label: 'Part time Jobs', count: 39, icon: 'bi-calendar', color: 'bg-purple' },
    { label: 'Overseas Jobs', count: 38, icon: 'bi-globe', color: 'bg-teal' },
    { label: 'Work From Home', count: 79, icon: 'bi-laptop', color: 'bg-pink' },
    { label: 'Fresher Jobs', count: 1427, icon: 'bi-person-plus', color: 'bg-orange' }
  ];

  // Popular Categories
   categories: Category[] = [];

  // Hot Jobs
  hotJobs: Job[] = [];
  
  // Featured Companies
  featuredCompanies: Company[] = [];
  
  // Latest Jobs
  latestJobs: Job[] = [];
  
  // Job Types
  jobTypes = [
    { type: 'FULL_TIME', label: 'Full Time', icon: 'bi-briefcase', count: 1250 },
    { type: 'PART_TIME', label: 'Part Time', icon: 'bi-clock', count: 320 },
    { type: 'REMOTE', label: 'Remote', icon: 'bi-laptop', count: 890 },
    { type: 'CONTRACT', label: 'Contract', icon: 'bi-file-earmark-text', count: 450 },
    { type: 'INTERNSHIP', label: 'Internship', icon: 'bi-mortarboard', count: 180 }
  ];

  // Locations
  popularLocations = [
    { city: 'Dhaka', country: 'Bangladesh', jobs: 1250, icon: 'bi-geo-alt' },
    { city: 'Chittagong', country: 'Bangladesh', jobs: 450, icon: 'bi-geo-alt' },
    { city: 'Sylhet', country: 'Bangladesh', jobs: 320, icon: 'bi-geo-alt' },
    { city: 'Rajshahi', country: 'Bangladesh', jobs: 180, icon: 'bi-geo-alt' },
    { city: 'Khulna', country: 'Bangladesh', jobs: 150, icon: 'bi-geo-alt' },
    { city: 'Barishal', country: 'Bangladesh', jobs: 120, icon: 'bi-geo-alt' }
  ];

  // Testimonials
  testimonials = [
    {
      name: 'Ahmed Rahman',
      role: 'Software Engineer at Google',
      image: 'assets/images/testimonial1.jpg',
      quote: 'Found my dream job within 2 weeks! The platform made job searching so easy.',
      rating: 5
    },
    {
      name: 'Fatima Begum',
      role: 'Marketing Manager',
      image: 'assets/images/testimonial2.jpg',
      quote: 'The company reviews helped me make the right career move. Highly recommended!',
      rating: 5
    },
    {
      name: 'Karim Ahmed',
      role: 'HR Director',
      image: 'assets/images/testimonial3.jpg',
      quote: 'Best platform for finding qualified candidates. Our hiring time reduced by 40%.',
      rating: 5
    }
  ];

  // Stats - Fixed property name
  stats = [
    { value: '50K+', label: 'Jobs Posted', icon: 'bi-briefcase' },
    { value: '500K+', label: 'Job Seekers', icon: 'bi-people' },
    { value: '10K+', label: 'Companies', icon: 'bi-building' },
    { value: '95%', label: 'Success Rate', icon: 'bi-trophy' },
    { value: '24/7', label: 'Support', icon: 'bi-headset' },
    { value: '150+', label: 'Countries', icon: 'bi-globe' }
  ];

  // Features section
  features = [
    {
      icon: 'bi-search',
      title: 'Smart Search',
      description: 'AI-powered job matching and recommendations'
    },
    {
      icon: 'bi-shield-check',
      title: 'Verified Companies',
      description: 'All companies are thoroughly vetted'
    },
    {
      icon: 'bi-chat-dots',
      title: 'Direct Communication',
      description: 'Connect directly with employers'
    },
    {
      icon: 'bi-graph-up',
      title: 'Career Insights',
      description: 'Analytics to track your job search progress'
    }
  ];

  // Track current testimonial for carousel
  currentTestimonialIndex = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private jobService: JobService,
    private companyService: CompanyService,
    private categoryService: CategoryService, 
    
  ) {
    this.searchForm = this.fb.group({
      keyword: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.loadHotJobs();
    this.loadFeaturedCompanies();
    this.loadLatestJobs();
    this.loadCategories();
  }

   loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
       
        this.categories = response.map(category => ({
          id: category.id,
          name: category.name,
          count: category.jobCount || 0
        })).slice(0, 18); 
      },
      error: (error) => {
        console.error('Error loading categories:', error);
       
      }
    });
  }

  loadHotJobs(): void {
    this.jobService.list({ size: 6 }).subscribe({
      next: (response) => {
        this.hotJobs = response.items.slice(0, 6);
      },
      error: (error) => {
        console.error('Error loading hot jobs:', error);
      }
    });
  }

  // Fixed method: removed 'verified' parameter which doesn't exist in the interface
  loadFeaturedCompanies(): void {
    this.companyService.list({ size: 8 }).subscribe({
      next: (response) => {
        this.featuredCompanies = response.items.slice(0, 8);
      },
      error: (error) => {
        console.error('Error loading featured companies:', error);
      }
    });
  }

  loadLatestJobs(): void {
    this.jobService.list({ page: 0, size: 8 }).subscribe({
      next: (response) => {
        this.latestJobs = response.items;
      },
      error: (error) => {
        console.error('Error loading latest jobs:', error);
      }
    });
  }

  searchJobs(): void {
    if (this.searchForm.valid) {
      this.loading = true;
      const { keyword, location } = this.searchForm.value;
      
      // Navigate to job list with search parameters
      this.router.navigate(['/jobs'], {
        queryParams: { 
          keyword: keyword || null,
          location: location || null
        }
      });
    }
  }

  // Navigation methods
  navigateToRegister(): void {
    this.router.navigate([`/auth/register`]);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getJobTypeIcon(jobType: JobType): string {
    const icons = {
      [JobType.FULL_TIME]: 'bi-briefcase-fill',
      [JobType.PART_TIME]: 'bi-clock-fill',
      [JobType.CONTRACT]: 'bi-file-earmark-text-fill',
      [JobType.REMOTE]: 'bi-laptop-fill',
      [JobType.INTERNSHIP]: 'bi-mortarboard-fill',
      [JobType.FREELANCE]: 'bi-person-workspace'
    };
    return icons[jobType] || 'bi-briefcase';
  }

  getExperienceBadgeClass(level: ExperienceLevel): string {
    const classes = {
      [ExperienceLevel.ENTRY]: 'bg-primary',
      [ExperienceLevel.MID]: 'bg-success',
      [ExperienceLevel.SENIOR]: 'bg-warning',
      [ExperienceLevel.DIRECTOR]: 'bg-info',
      [ExperienceLevel.EXECUTIVE]: 'bg-dark'
    };
    return classes[level] || 'bg-secondary';
  }

 getDaysAgo(date: string | Date): string {
    if (!date) return 'Recently';
    
    // Convert string to Date if needed
    const postedDate = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
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

  scrollToCategories(): void {
    this.scrollToSection('categories');
  }

  // Testimonial carousel methods
  nextTestimonial(): void {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  previousTestimonial(): void {
    this.currentTestimonialIndex = (this.currentTestimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  goToTestimonial(index: number): void {
    this.currentTestimonialIndex = index;
  }

  get currentTestimonial() {
    return this.testimonials[this.currentTestimonialIndex];
  }
}
