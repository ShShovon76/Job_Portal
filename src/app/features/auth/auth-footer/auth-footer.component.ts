import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-footer',
  templateUrl: './auth-footer.component.html',
  styleUrls: ['./auth-footer.component.scss']
})
export class AuthFooterComponent implements OnInit {
  currentYear: number;
  isAuthenticated = false;

  constructor(private router: Router) {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    // You can check authentication status if needed
    // this.authService.getCurrentUser$().subscribe(user => {
    //   this.isAuthenticated = !!user;
    // });
  }

  // Navigation methods
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  navigateToPrivacyPolicy(): void {
    this.router.navigate(['/privacy-policy']);
  }

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
  }

  navigateToHelp(): void {
    this.router.navigate(['/help']);
  }

  // Social media links (open in new tab)
  openFacebook(): void {
    window.open('https://facebook.com', '_blank');
  }

  openTwitter(): void {
    window.open('https://twitter.com', '_blank');
  }

  openLinkedIn(): void {
    window.open('https://linkedin.com', '_blank');
  }

  openInstagram(): void {
    window.open('https://instagram.com', '_blank');
  }

  // Contact methods
  sendEmail(): void {
    window.location.href = 'mailto:support@jobportal.com';
  }

  // Utility methods
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
