import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobSeekerProfileService } from 'src/app/core/services/job-seeker-profile.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ResumeService } from 'src/app/core/services/resume.service';
import { Resume } from 'src/app/models/job-application.model';
import { JobSeekerProfile } from 'src/app/models/jobseeker-profile.model';

@Component({
  selector: 'app-applicant-profile',
  templateUrl: './applicant-profile.component.html',
  styleUrls: ['./applicant-profile.component.scss']
})
export class ApplicantProfileComponent implements OnInit, OnDestroy {

  profile: JobSeekerProfile | null = null;
  user: any;
  isLoading = true;

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private profileService: JobSeekerProfileService,
    private notificationService: NotificationService,
    private resumeService: ResumeService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const currentUser = this.authService.getCurrentUserSnapshot();

    if (!currentUser) {
      this.notificationService.showError('User not logged in');
      return;
    }

    this.user = currentUser;

    this.subscriptions.add(
      this.profileService.getProfileByUserId(currentUser.id).subscribe({
        next: (profile) => {
          this.profile = {
            ...profile,
            skills: profile.skills ?? [],
            portfolioLinks: profile.portfolioLinks ?? [],
            preferredLocations: profile.preferredLocations ?? [],
            preferredJobTypes: profile.preferredJobTypes ?? [],
            education: profile.education ?? [],
            experience: profile.experience ?? [],
            certifications: profile.certifications ?? [],
            resumes: profile.resumes ?? []
          };
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.notificationService.showError('Failed to load profile');
          this.isLoading = false;
        }
      })
    );
  }

  // ========= HELPERS =========

  getJobTypeLabel(type: string): string {
    const map: Record<string, string> = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      REMOTE: 'Remote',
      INTERNSHIP: 'Internship',
      FREELANCE: 'Freelance'
    };
    return map[type] || type;
  }

  downloadResume(resume: Resume) {
  this.resumeService.downloadResume(resume.id).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = resume.fileUrl || 'resume.pdf';
    a.click();

    URL.revokeObjectURL(url);
  });
}



  getPrimaryResume(): Resume | null {
    return this.profile?.resumes?.find(r => r.primaryResume) || null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
