import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;
  loading = false;
  currentUser: User | null = null;

  contactInfo = [
    {
      icon: 'bi-geo-alt',
      title: 'Office Address',
      details: ['123 Business Street', 'San Francisco, CA 94107', 'United States'],
      color: 'text-primary'
    },
    {
      icon: 'bi-telephone',
      title: 'Phone Number',
      details: ['+1 (555) 123-4567', 'Mon-Fri 9am-6pm PST'],
      color: 'text-success'
    },
    {
      icon: 'bi-envelope',
      title: 'Email Address',
      details: ['info@jobportal.com', 'support@jobportal.com'],
      color: 'text-danger'
    }
  ];

  faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click on the "Sign Up" button in the top right corner and follow the registration process. You can register as a job seeker or as an employer.',
      expanded: false
    },
    {
      question: 'Is the platform free for job seekers?',
      answer: 'Yes, job searching and applying are completely free for job seekers. You can create a profile, upload your resume, and apply to unlimited jobs without any charges.',
      expanded: false
    },
    {
      question: 'How do companies post jobs?',
      answer: 'Companies can create an employer account and post jobs through their dashboard. After verification, employers can post jobs, manage applications, and search for candidates.',
      expanded: false
    },
    {
      question: 'How long does job verification take?',
      answer: 'Job verification typically takes 24-48 hours during business days. Our team reviews each job posting to ensure quality and legitimacy.',
      expanded: false
    },
    {
      question: 'Can I edit my submitted application?',
      answer: 'You can edit your application before the employer views it. Once viewed, you\'ll need to contact the employer directly for any changes.',
      expanded: false
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your email to reset your password.',
      expanded: false
    }
  ];

  departments = [
    { id: 'general', name: 'General Inquiry', icon: 'bi-info-circle' },
    { id: 'technical', name: 'Technical Support', icon: 'bi-tools' },
    { id: 'billing', name: 'Billing & Payment', icon: 'bi-credit-card' },
    { id: 'feedback', name: 'Feedback & Suggestions', icon: 'bi-chat-left-text' },
    { id: 'partnership', name: 'Business Partnership', icon: 'bi-handshake' },
    { id: 'abuse', name: 'Report Abuse', icon: 'bi-shield-exclamation' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      category: ['general', Validators.required],
      phone: ['', [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]],
      company: [''],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.contactForm.patchValue({
          name: user.fullName,
          email: user.email,
          phone: user.phone || ''
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.contactForm.valid) {
      this.loading = true;
      
      // In a real application, you would call your ContactService here
      // Example: this.contactService.submitContactForm(this.contactForm.value).subscribe(...)
      
      // Simulate API call
      setTimeout(() => {
        console.log('Form submitted:', this.contactForm.value);
        
        // Show success message
        alert('Thank you for your message! We will get back to you within 24-48 hours.');
        
        // Reset form
        if (this.currentUser) {
          this.contactForm.reset({
            name: this.currentUser.fullName,
            email: this.currentUser.email,
            phone: this.currentUser.phone || '',
            category: 'general',
            agreeToTerms: false
          });
        } else {
          this.contactForm.reset({
            category: 'general',
            agreeToTerms: false
          });
        }
        
        this.submitted = false;
        this.loading = false;
      }, 1500);
    } else {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.departments.find(d => d.id === categoryId);
    return category?.icon || 'bi-info-circle';
  }

  getCategoryName(categoryId: string): string {
    const category = this.departments.find(d => d.id === categoryId);
    return category?.name || 'General Inquiry';
  }

  toggleFaq(index: number): void {
    this.faqs[index].expanded = !this.faqs[index].expanded;
  }

  scrollToForm(): void {
    const formElement = document.getElementById('contactForm');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getSupportHours(): string {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();
    
    // Monday-Friday, 9 AM - 6 PM PST
    if (day >= 1 && day <= 5 && hours >= 9 && hours < 18) {
      return 'We\'re currently available. Response time: 1-2 hours';
    } else {
      return 'We\'ll get back to you within 24 hours';
    }
  }

  getResponseTime(category: string): string {
    const responseTimes: { [key: string]: string } = {
      'general': '24-48 hours',
      'technical': '2-4 hours',
      'billing': '4-8 hours',
      'feedback': '2-3 days',
      'partnership': '1-2 days',
      'abuse': '1-4 hours'
    };
    
    return responseTimes[category] || '24-48 hours';
  }
}
