import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  newsletterForm: FormGroup;
  submitted = false;
  newsletterSubscribed = false;

  quickLinks = [
    { label: 'Find Jobs', url: '/jobs', icon: 'bi-search' },
    { label: 'Browse Companies', url: '/companies', icon: 'bi-building' },
    { label: 'Post a Job', url: '/employer/post-job', icon: 'bi-plus-circle' },
    { label: 'Career Advice', url: '/resources/advice', icon: 'bi-lightbulb' },
    { label: 'Salary Calculator', url: '/tools/salary-calculator', icon: 'bi-calculator' },
    { label: 'Resume Builder', url: '/tools/resume-builder', icon: 'bi-file-earmark-text' }
  ];

  employerLinks = [
    { label: 'Employer Login', url: '/employer/login' },
    { label: 'Post a Job Free', url: '/employer/post-job' },
    { label: 'Pricing Plans', url: '/pricing' },
    { label: 'Employer Resources', url: '/employer/resources' },
    { label: 'Hiring Solutions', url: '/employer/solutions' },
    { label: 'Recruitment Services', url: '/employer/services' }
  ];

  jobSeekerLinks = [
    { label: 'Job Seeker Login', url: '/auth/login' },
    { label: 'Create Resume', url: '/job-seeker/resume' },
    { label: 'Career Resources', url: '/resources' },
    { label: 'Interview Tips', url: '/resources/interview-tips' },
    { label: 'Job Search Guide', url: '/resources/guide' },
    { label: 'Salary Guide', url: '/resources/salary-guide' }
  ];

  legalLinks = [
    { label: 'Privacy Policy', url: '/legal/privacy' },
    { label: 'Terms of Service', url: '/legal/terms' },
    { label: 'Cookie Policy', url: '/legal/cookies' },
    { label: 'GDPR Compliance', url: '/legal/gdpr' },
    { label: 'Accessibility', url: '/legal/accessibility' },
    { label: 'Security', url: '/legal/security' }
  ];

  companyLinks = [
    { label: 'About Us', url: '/about' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'Careers', url: '/careers' },
    { label: 'Blog', url: '/blog' },
    { label: 'Press', url: '/press' },
    { label: 'Partners', url: '/partners' }
  ];

  popularCategories = [
    { name: 'Software Engineering', count: 1250 },
    { name: 'Marketing', count: 890 },
    { name: 'Sales', count: 760 },
    { name: 'Finance', count: 540 },
    { name: 'Healthcare', count: 1120 },
    { name: 'Design', count: 670 }
  ];

  socialLinks = [
    { platform: 'LinkedIn', icon: 'bi-linkedin', url: 'https://linkedin.com/company/jobportal', color: '#0A66C2' },
    { platform: 'Twitter', icon: 'bi-twitter', url: 'https://twitter.com/jobportal', color: '#1DA1F2' },
    { platform: 'Facebook', icon: 'bi-facebook', url: 'https://facebook.com/jobportal', color: '#1877F2' },
    { platform: 'Instagram', icon: 'bi-instagram', url: 'https://instagram.com/jobportal', color: '#E4405F' },
    { platform: 'YouTube', icon: 'bi-youtube', url: 'https://youtube.com/jobportal', color: '#FF0000' }
  ];

  appStores = [
    { 
      store: 'App Store', 
      icon: 'bi-apple', 
      url: '#',
      badge: 'assets/images/app-store-badge.svg'
    },
    { 
      store: 'Google Play', 
      icon: 'bi-google-play', 
      url: '#',
      badge: 'assets/images/google-play-badge.svg'
    }
  ];

  countries = [
    { name: 'United States', flag: '🇺🇸' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'India', flag: '🇮🇳' }
  ];

  constructor(private fb: FormBuilder) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      jobAlerts: [true],
      careerTips: [true],
      promotions: [false]
    });
  }

  subscribeNewsletter(): void {
    this.submitted = true;
    
    if (this.newsletterForm.valid) {
      this.newsletterSubscribed = true;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Newsletter subscription:', this.newsletterForm.value);
        this.newsletterForm.reset({
          jobAlerts: true,
          careerTips: true,
          promotions: false
        });
        this.submitted = false;
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          this.newsletterSubscribed = false;
        }, 5000);
      }, 1000);
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getTrustBadges(): { icon: string, text: string }[] {
    return [
      { icon: 'bi-shield-check', text: 'SSL Secured' },
      { icon: 'bi-lock', text: 'Privacy Protected' },
      { icon: 'bi-award', text: 'Trusted Platform' },
      { icon: 'bi-check-circle', text: 'Verified Companies' }
    ];
  }
}
