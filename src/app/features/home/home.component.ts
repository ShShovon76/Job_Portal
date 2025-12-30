import { animate, keyframes, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
   animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('0.6s 0.2s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('0.6s 0.4s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('stagger', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger('0.1s', [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('pulse', [
      transition('* => *', [
        animate('2s ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  stats = [
    { number: '10K+', label: 'Jobs Posted', icon: 'bi-briefcase' },
    { number: '50K+', label: 'Happy Candidates', icon: 'bi-people' },
    { number: '5K+', label: 'Companies', icon: 'bi-building' },
    { number: '98%', label: 'Success Rate', icon: 'bi-check-circle' }
  ];

  features = [
    { 
      title: 'Smart Job Matching', 
      description: 'AI-powered algorithms find the perfect job matches based on your skills and preferences.',
      icon: 'bi-search-heart',
      color: 'primary'
    },
    { 
      title: 'Easy Apply', 
      description: 'One-click application process with resume parsing and auto-fill capabilities.',
      icon: 'bi-send-check',
      color: 'success'
    },
    { 
      title: 'Career Insights', 
      description: 'Get personalized career advice and market trends to stay ahead.',
      icon: 'bi-graph-up',
      color: 'info'
    },
    { 
      title: 'Secure Platform', 
      description: 'Bank-level security to protect your personal and professional information.',
      icon: 'bi-shield-check',
      color: 'warning'
    }
  ];

  testimonials = [
    {
      quote: 'Found my dream job in just 2 weeks! The platform made job hunting effortless.',
      author: 'Sarah Chen',
      role: 'Senior Developer at TechCorp',
      avatar: 'SC'
    },
    {
      quote: 'Hired 5 amazing developers in record time. The quality of candidates is exceptional.',
      author: 'Michael Rodriguez',
      role: 'CTO at StartupXYZ',
      avatar: 'MR'
    }
  ];

  isScrolled = false;
  currentTestimonial = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Auto rotate testimonials
    setInterval(() => {
      this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
    }, 5000);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }
}
