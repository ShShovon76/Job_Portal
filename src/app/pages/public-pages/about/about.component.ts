
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CompanyService } from 'src/app/core/services/company.service';
import { JobSeekerProfileService } from 'src/app/core/services/job-seeker-profile.service';
import { JobService } from 'src/app/core/services/job.service';
import { SearchService } from 'src/app/core/services/search.service';
import { UserService } from 'src/app/core/services/user.service';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
  
  // Live stats from your backend
  liveStats = {
    totalJobs: 0,
    totalCompanies: 0,
    totalUsers: 0,
    successfulHires: 0,
    popularSkills: [] as string[],
    topCompanies: [] as any[]
  };

  // Core Values (same as before)
  coreValues = [
    {
      icon: 'bi bi-shield-check',
      title: 'Integrity',
      description: 'We believe in transparency and honesty in all our interactions, building trust with every connection.',
      color: 'bg-success'
    },
    {
      icon: 'bi bi-lightbulb',
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology to enhance user experience.',
      color: 'bg-primary'
    },
    {
      icon: 'bi bi-people-fill',
      title: 'Community',
      description: 'Fostering a supportive ecosystem where professionals and companies grow together.',
      color: 'bg-warning'
    },
    {
      icon: 'bi bi-rocket-takeoff',
      title: 'Excellence',
      description: 'Striving for the highest standards in everything we do, from design to customer support.',
      color: 'bg-info'
    },
    {
      icon: 'bi bi-heart-fill',
      title: 'Inclusivity',
      description: 'Creating equal opportunities for all, regardless of background, location, or experience level.',
      color: 'bg-purple'
    },
    {
      icon: 'bi bi-speedometer2',
      title: 'Agility',
      description: 'Rapidly adapting to market changes and user needs with flexible, scalable solutions.',
      color: 'bg-rose'
    }
  ];

  // Milestones Timeline (same as before)
  milestones = [
    {
      year: '2018',
      title: 'Foundation',
      description: 'Founded with a vision to revolutionize online recruitment and job searching.',
      icon: 'bi bi-rocket'
    },
    {
      year: '2019',
      title: 'Launch',
      description: 'Successfully launched our MVP with 100 companies and 5,000 job seekers.',
      icon: 'bi bi-flag'
    },
    {
      year: '2020',
      title: 'Growth',
      description: 'Expanded to 10 countries with 1,000+ companies and 50,000+ job seekers.',
      icon: 'bi bi-graph-up'
    },
    {
      year: '2021',
      title: 'Innovation',
      description: 'Introduced AI-powered matching and advanced analytics dashboard.',
      icon: 'bi bi-cpu'
    },
    {
      year: '2022',
      title: 'Recognition',
      description: 'Awarded "Best Job Portal" by Tech Innovation Awards.',
      icon: 'bi bi-trophy'
    },
    {
      year: '2023',
      title: 'Expansion',
      description: 'Launched mobile apps and expanded to 25 countries worldwide.',
      icon: 'bi bi-globe'
    }
  ];

  // Leadership Team (same as before)
  leadershipTeam = [
    {
      name: 'Sarah Johnson',
      position: 'CEO & Founder',
      bio: 'Former HR executive with 15+ years experience in talent acquisition.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahjohnson'
    },
    {
      name: 'Michael Chen',
      position: 'CTO',
      bio: 'Tech visionary with expertise in scalable platforms and machine learning.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      linkedin: 'https://linkedin.com/in/michaelchen',
      twitter: 'https://twitter.com/michaelchen'
    },
    {
      name: 'Emma Rodriguez',
      position: 'Head of Product',
      bio: 'Product leader passionate about creating intuitive user experiences.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMcurCPRPk2o3O5usdqWn3hVPfgDiX0-0VEA&s',
      linkedin: 'https://linkedin.com/in/emmarodriguez',
      twitter: 'https://twitter.com/emmarodriguez'
    },
    {
      name: 'David Park',
      position: 'Head of Growth',
      bio: 'Marketing expert focused on building global communities and partnerships.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      linkedin: 'https://linkedin.com/in/davidpark',
      twitter: 'https://twitter.com/davidpark'
    }
  ];

  // Platform Statistics - Now using live data
  platformStats = [
    {
      icon: 'bi bi-people',
      value: 0,
      label: 'Active Users',
      color: 'bg-light-blue',
      displayedValue: 0,
      key: 'totalUsers'
    },
    {
      icon: 'bi bi-building',
      value: 0,
      label: 'Companies',
      color: 'bg-light-green',
      displayedValue: 0,
      key: 'totalCompanies'
    },
    {
      icon: 'bi bi-briefcase',
      value: 0,
      label: 'Jobs Posted',
      color: 'bg-light-purple',
      displayedValue: 0,
      key: 'totalJobs'
    },
    {
      icon: 'bi bi-hand-thumbs-up',
      value: 500000, // This could also be fetched from analytics
      label: 'Successful Hires',
      color: 'bg-light-orange',
      displayedValue: 0,
      key: 'successfulHires'
    }
  ];

  // Testimonials (same as before)
  testimonials = [
    {
      name: 'Jessica Miller',
      role: 'Software Engineer',
      company: 'Google',
      content: 'Found my dream job in 2 weeks! The AI matching was incredibly accurate.',
      avatar: 'https://img.freepik.com/free-photo/lifestyle-beauty-fashion-people-emotions-concept-cheerful-cute-shy-asian-girl-cross-arms-chest-modest-pose-looking-away-as-laughing-smiling-silly-stand-white-background_1258-59330.jpg?semt=ais_hybrid&w=740&q=80'
    },
    {
      name: 'Robert Kim',
      role: 'HR Director',
      company: 'Amazon',
      content: 'Hired 20 top-tier developers in 3 months. The platform saves us 40% in hiring costs.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'Lisa Wang',
      role: 'Marketing Manager',
      company: 'Meta',
      content: 'The analytics dashboard transformed our recruitment strategy. Highly recommended!',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  ];

  // Popular skills for display
  popularSkills: string[] = [];

  constructor(
    private jobService: JobService,
    private companyService: CompanyService,
    private userService: UserService,
    private searchService: SearchService,
    private jobSeekerProfileService: JobSeekerProfileService
  ) { }

  ngOnInit(): void {
    this.loadLiveStats();
    this.loadPopularSkills();
  }

  ngAfterViewInit(): void {
    // Start counting animations after view is initialized
    setTimeout(() => {
      this.startCounting();
    }, 500);
  }

  loadLiveStats(): void {
    // Load jobs count
    this.jobService.list({ size: 1 }).subscribe({
      next: (response) => {
        this.liveStats.totalJobs = response.totalItems || 0;
        this.updatePlatformStats('totalJobs', response.totalItems || 0);
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.liveStats.totalJobs = 150000; // Fallback value
      }
    });

    // Load companies count
    this.companyService.list({ size: 1 }).subscribe({
      next: (response) => {
        this.liveStats.totalCompanies = response.totalItems || 0;
        this.updatePlatformStats('totalCompanies', response.totalItems || 0);
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.liveStats.totalCompanies = 25000; // Fallback value
      }
    });

    // Load users count - using searchUsers if available, or fallback
    if (this.userService.searchUsers) {
      this.userService.searchUsers({ size: 1 }).subscribe({
        next: (response: any) => {
          const totalUsers = response.totalItems || response.items?.length || 0;
          this.liveStats.totalUsers = totalUsers;
          this.updatePlatformStats('totalUsers', totalUsers);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.liveStats.totalUsers = 500000; // Fallback value
        }
      });
    } else {
      // Fallback if userService doesn't have searchUsers
      this.liveStats.totalUsers = 500000;
      this.updatePlatformStats('totalUsers', 500000);
    }
  }

  loadPopularSkills(): void {
    // Load popular skills from search service or job seeker profile service
    this.searchService.getPopularSkills(8).subscribe({
      next: (skills) => {
        this.liveStats.popularSkills = skills || [];
        this.popularSkills = skills || [];
      },
      error: (error) => {
        console.error('Error loading popular skills:', error);
        // Fallback popular skills
        this.popularSkills = [
          'JavaScript', 'React', 'Angular', 'Node.js',
          'Python', 'Java', 'AWS', 'DevOps'
        ];
      }
    });

    // You could also load recent job applications for "successful hires" metric
    // This would require an AnalyticsService call
  }

  updatePlatformStats(key: string, value: number): void {
    const stat = this.platformStats.find(s => s.key === key);
    if (stat) {
      stat.value = value;
      if (this.isInViewport()) {
        this.animateStat(stat);
      }
    }
  }

  private initScrollAnimations(): void {
    // Basic scroll animation implementation
    window.addEventListener('scroll', () => {
      const elements = document.querySelectorAll('.value-card, .timeline-item, .team-card');
      elements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        // If element is in viewport
        if (position.top < window.innerHeight - 100) {
          element.classList.add('animate-in');
        }
      });

      // Check if stats section is in viewport
      if (this.isInViewport()) {
        this.animateAllStats();
      }
    });
  }

  private isInViewport(): boolean {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return false;
    
    const rect = statsSection.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75
    );
  }

  private startCounting(): void {
    if (this.isInViewport()) {
      this.animateAllStats();
    } else {
      // Set up intersection observer
      const statsSection = document.querySelector('.stats-section');
      if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.animateAllStats();
              observer.disconnect();
            }
          });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
      }
    }
  }

  private animateAllStats(): void {
    this.platformStats.forEach(stat => {
      this.animateStat(stat);
    });
  }

  private animateStat(stat: any): void {
    if (stat.animationStarted) return;
    
    stat.animationStarted = true;
    const duration = 2000;
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      current += increment;
      step++;

      if (current >= stat.value) {
        current = stat.value;
        clearInterval(timer);
      }

      stat.displayedValue = Math.floor(current);
      
      if (step >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  }

  // Format numbers with commas
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString() + '+';
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getTeamMemberInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // Get a random testimonial
  getRandomTestimonial() {
    return this.testimonials[Math.floor(Math.random() * this.testimonials.length)];
  }
}