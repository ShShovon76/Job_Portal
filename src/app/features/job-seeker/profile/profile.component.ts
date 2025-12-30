import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobSeekerProfileService } from 'src/app/core/services/job-seeker-profile.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ResumeService } from 'src/app/core/services/resume.service';
import { Resume } from 'src/app/models/job-application.model';
import { JobSeekerProfile } from 'src/app/models/jobseeker-profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: JobSeekerProfile | null = null;
  isLoading = true;
  isEditing = false;
  currentSection: 'summary' | 'education' | 'experience' | 'skills' | 'certifications' = 'summary';
  private subscriptions = new Subscription();
  userId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private profileService: JobSeekerProfileService,
    private notificationService: NotificationService,
     private resumeService: ResumeService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const currentUser = this.authService.getCurrentUserSnapshot();
    if (!currentUser) return;

    this.userId = currentUser.id;
    
    this.subscriptions.add(
      this.profileService.getProfileByUserId(this.userId).subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.notificationService.showError('Failed to load profile');
          this.isLoading = false;
        }
      })
    );
  }

  navigateToEdit(): void {
    this.router.navigate(['/job-seeker/profile/edit']);
  }

  setActiveSection(section: typeof this.currentSection): void {
    this.currentSection = section;
  }

  getProfileCompleteness(): void {
    this.subscriptions.add(
      this.profileService.getProfileCompleteness(this.userId).subscribe({
        next: (completeness) => {
          console.log('Profile completeness:', completeness);
          // Update UI with completeness data
        },
        error: (error) => {
          console.error('Error getting profile completeness:', error);
        }
      })
    );
  }

  downloadResume(resume: Resume): void {
    if (resume.fileUrl) {
      window.open(resume.fileUrl, '_blank');
    }
  }

  deleteResume(resumeId: number): void {
  if (confirm('Are you sure you want to delete this resume?')) {
    this.subscriptions.add(
      this.resumeService.deleteResume(this.userId, resumeId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Resume deleted successfully');
          this.loadProfile(); // Refresh UI
        },
        error: (error) => {
          console.error('Error deleting resume:', error);
          this.notificationService.showError('Failed to delete resume');
        }
      })
    );
  }
}

  setPrimaryResume(resumeId: number): void {
  this.subscriptions.add(
    this.resumeService.setPrimary(this.userId, resumeId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Primary resume updated');
        this.loadProfile(); // Refresh the profile to show the new primary status
      },
      error: (error) => {
        console.error('Error setting primary resume:', error);
        this.notificationService.showError('Failed to update primary resume');
      }
    })
  );
}

  getSkillsCount(): number {
    return this.profile?.skills?.length || 0;
  }

  getEducationCount(): number {
    return this.profile?.education?.length || 0;
  }

  getExperienceCount(): number {
    return this.profile?.experience?.length || 0;
  }

  getCertificationsCount(): number {
    return this.profile?.certifications?.length || 0;
  }

  formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Present';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Present';
    }
    
    return dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Present';
  }
}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}