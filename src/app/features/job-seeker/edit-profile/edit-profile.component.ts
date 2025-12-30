import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobSeekerProfileService } from 'src/app/core/services/job-seeker-profile.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ResumeService } from 'src/app/core/services/resume.service';
import { UserService } from 'src/app/core/services/user.service';
import { Certification } from 'src/app/models/certification.model';
import { Education } from 'src/app/models/education.model';
import { Experience } from 'src/app/models/experience.model';
import { Resume } from 'src/app/models/job-application.model';
import { JobSeekerProfile } from 'src/app/models/jobseeker-profile.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy {

  @ViewChild('skillInput') skillInput!: ElementRef;
  @ViewChild('locationInput') locationInput!: ElementRef;
  @ViewChild('portfolioInput') portfolioInput!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('profileImageInput') profileImageInput!: ElementRef;

  profile: JobSeekerProfile | null = null;
  user!: User;

  isLoading = true;
  isSaving = false;
  isUploading = false;
  uploadProgress = 0;

  userId!: number;

  profileForm!: FormGroup;

  currentSkill = '';
  currentLocation = '';
  currentPortfolioLink = '';

  jobTypeOptions = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP', 'FREELANCE'];

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private profileService: JobSeekerProfileService,
    private userService: UserService,
    private resumeService: ResumeService,
    private notificationService: NotificationService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadUserAndProfile();
  }

  // =====================================================
  // FORM SETUP
  // =====================================================
  private createForm(): void {
    this.profileForm = this.fb.group({
      // USER FIELDS
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      profilePictureUrl: [''],

      // PROFILE FIELDS
      headline: [''],
      summary: ['', Validators.maxLength(2000)],

      skills: [[]],
      portfolioLinks: [[]],
      preferredJobTypes: [[]],
      preferredLocations: [[]],

      education: this.fb.array([]),
      experience: this.fb.array([]),
      certifications: this.fb.array([])
    });
  }

  // =====================================================
  // LOAD USER + PROFILE
  // =====================================================
  private loadUserAndProfile(): void {
    const currentUser = this.authService.getCurrentUserSnapshot();
    if (!currentUser) return;

    this.userId = currentUser.id;

    this.subscriptions.add(
      this.userService.getUser(this.userId).subscribe({
        next: user => {
          this.user = user;

          this.profileForm.patchValue({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            profilePictureUrl: user.profilePictureUrl
          });

          this.loadProfile();
        },
        error: () => {
          this.notificationService.showError('Failed to load user info');
          this.isLoading = false;
        }
      })
    );
  }

  private loadProfile(): void {
    this.subscriptions.add(
      this.profileService.getProfileByUserId(this.userId).subscribe({
        next: profile => {
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

          this.populateForm(this.profile);
          this.isLoading = false;
        },
        error: () => {
          this.notificationService.showError('Failed to load profile');
          this.isLoading = false;
        }
      })
    );
  }

  private populateForm(profile: JobSeekerProfile): void {
    this.profileForm.patchValue({
      headline: profile.headline || '',
      summary: profile.summary || '',
      skills: profile.skills || [],
      portfolioLinks: profile.portfolioLinks || [],
      preferredJobTypes: profile.preferredJobTypes || [],
      preferredLocations: profile.preferredLocations || []
    });

    this.educationFormArray.clear();
    profile.education?.forEach(e => this.addEducation(e));

    this.experienceFormArray.clear();
    profile.experience?.forEach(e => this.addExperience(e));

    this.certificationFormArray.clear();
    profile.certifications?.forEach(c => this.addCertification(c));
  }

  // =====================================================
  // FORM ARRAY GETTERS
  // =====================================================
  get educationFormArray(): FormArray {
    return this.profileForm.get('education') as FormArray;
  }

  get experienceFormArray(): FormArray {
    return this.profileForm.get('experience') as FormArray;
  }

  get certificationFormArray(): FormArray {
    return this.profileForm.get('certifications') as FormArray;
  }

  get skillsArray(): string[] {
    return this.profileForm.get('skills')?.value || [];
  }

  get portfolioLinksArray(): string[] {
    return this.profileForm.get('portfolioLinks')?.value || [];
  }

  get locationsArray(): string[] {
    return this.profileForm.get('preferredLocations')?.value || [];
  }

  get resumes(): Resume[] {
    return this.profile?.resumes || [];
  }

  // =====================================================
  // EDUCATION
  // =====================================================
  createEducationForm(education?: Education): FormGroup {
    return this.fb.group({
      degree: [education?.degree || '', Validators.required],
      institution: [education?.institution || '', Validators.required],
      startDate: [education?.startDate ? this.formatDateForInput(education.startDate) : ''],
      endDate: [education?.endDate ? this.formatDateForInput(education.endDate) : ''],
      grade: [education?.grade || '']
    });
  }

  addEducation(education?: Education) {
    this.educationFormArray.push(this.createEducationForm(education));
  }

  removeEducation(i: number) {
    this.educationFormArray.removeAt(i);
  }

  // =====================================================
  // EXPERIENCE
  // =====================================================
  createExperienceForm(experience?: Experience): FormGroup {
    return this.fb.group({
      jobTitle: [experience?.jobTitle || '', Validators.required],
      companyName: [experience?.companyName || '', Validators.required],
      startDate: [experience?.startDate ? this.formatDateForInput(experience.startDate) : ''],
      endDate: [experience?.endDate ? this.formatDateForInput(experience.endDate) : ''],
      responsibilities: [experience?.responsibilities || '', Validators.required]
    });
  }

  addExperience(experience?: Experience) {
    this.experienceFormArray.push(this.createExperienceForm(experience));
  }

  removeExperience(index: number) {
    this.experienceFormArray.removeAt(index);
  }

  // =====================================================
  // CERTIFICATIONS
  // =====================================================
  createCertificationForm(cert?: Certification): FormGroup {
    return this.fb.group({
      title: [cert?.title || '', Validators.required],
      issuer: [cert?.issuer || '', Validators.required],
      issueDate: [cert?.issueDate ? this.formatDateForInput(cert.issueDate) : ''],
      expiryDate: [cert?.expiryDate ? this.formatDateForInput(cert.expiryDate) : ''],
      credentialUrl: [cert?.credentialUrl || '']
    });
  }

  addCertification(cert?: Certification) {
    this.certificationFormArray.push(this.createCertificationForm(cert));
  }

  removeCertification(index: number) {
    this.certificationFormArray.removeAt(index);
  }

  // =====================================================
  // SKILLS / LOCATIONS / LINKS
  // =====================================================
  onSkillKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  addSkill() {
    const skill = this.currentSkill.trim();
    if (skill && !this.skillsArray.includes(skill)) {
      this.profileForm.patchValue({ skills: [...this.skillsArray, skill] });
      this.currentSkill = '';
    }
  }

  removeSkill(i: number) {
    const arr = [...this.skillsArray];
    arr.splice(i, 1);
    this.profileForm.patchValue({ skills: arr });
  }

  onLocationKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addLocation();
    }
  }

  addLocation() {
    const value = this.currentLocation.trim();
    if (value && !this.locationsArray.includes(value)) {
      this.profileForm.patchValue({
        preferredLocations: [...this.locationsArray, value]
      });
      this.currentLocation = '';
    }
  }

  removeLocation(i: number) {
    const arr = [...this.locationsArray];
    arr.splice(i, 1);
    this.profileForm.patchValue({ preferredLocations: arr });
  }

  onPortfolioKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addPortfolioLink();
    }
  }

  addPortfolioLink() {
    const link = this.currentPortfolioLink.trim();
    if (!link || !this.isValidUrl(link)) {
      this.notificationService.showError('Enter a valid URL');
      return;
    }

    if (!this.portfolioLinksArray.includes(link)) {
      this.profileForm.patchValue({
        portfolioLinks: [...this.portfolioLinksArray, link]
      });
      this.currentPortfolioLink = '';
    }
  }

  removePortfolioLink(i: number) {
    const arr = [...this.portfolioLinksArray];
    arr.splice(i, 1);
    this.profileForm.patchValue({ portfolioLinks: arr });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }

  // =====================================================
  // JOB TYPES
  // =====================================================
  toggleJobType(type: string) {
    const list = [...(this.profileForm.get('preferredJobTypes')?.value || [])];
    const idx = list.indexOf(type);
    idx >= 0 ? list.splice(idx, 1) : list.push(type);
    this.profileForm.patchValue({ preferredJobTypes: list });
  }

  isJobTypeSelected(type: string): boolean {
    return (this.profileForm.get('preferredJobTypes')?.value || []).includes(type);
  }

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

  // =====================================================
  // PROFILE PICTURE
  // =====================================================
  onProfileImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.subscriptions.add(
      this.userService.uploadProfilePicture(this.userId, file).subscribe({
        next: (res: any) => {
          this.profileForm.patchValue({
            profilePictureUrl: res?.profilePictureUrl
          });
          this.notificationService.showSuccess('Profile picture updated');
        },
        error: () => {
          this.notificationService.showError('Failed to upload profile picture');
        }
      })
    );
  }

  // =====================================================
  // RESUME
  // =====================================================
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowed.includes(file.type)) {
      this.notificationService.showError('Only PDF or Word files allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.showError('File must be under 5MB');
      return;
    }

    this.uploadResume(file);
  }

  uploadResume(file: File) {
    this.isUploading = true;
    this.uploadProgress = 0;

    const timer = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) clearInterval(timer);
    }, 200);

    this.subscriptions.add(
      this.resumeService.uploadResume(this.userId, file).subscribe({
        next: () => {
          clearInterval(timer);
          this.uploadProgress = 100;
          this.notificationService.showSuccess('Resume uploaded');
          setTimeout(() => {
            this.isUploading = false;
            this.uploadProgress = 0;
            this.loadProfile();
          }, 400);
        },
        error: () => {
          clearInterval(timer);
          this.isUploading = false;
          this.uploadProgress = 0;
          this.notificationService.showError('Resume upload failed');
        }
      })
    );
  }

  deleteResume(id: number) {
    if (!confirm('Delete this resume?')) return;

    this.subscriptions.add(
      this.resumeService.deleteResume(this.userId, id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Resume deleted');
          this.loadProfile();
        },
       error: (err) => {
  this.notificationService.showError(
    err?.error?.message || 'Cannot delete this resume'
  );
}
      })
    );
  }

  setPrimaryResume(id: number) {
    this.subscriptions.add(
      this.resumeService.setPrimary(this.userId, id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Primary resume updated');
          this.loadProfile();
        },
        error: () => this.notificationService.showError('Failed to update primary resume')
      })
    );
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.notificationService.showError('Please fix validation errors');
      return;
    }

    this.isSaving = true;

    const payload = this.prepareFormData();

    this.subscriptions.add(
      this.profileService.createOrUpdateProfile(this.userId, payload).subscribe({
        next: () => {
          // update user info separately
          this.userService.updateUser(this.userId, {
            fullName: this.profileForm.value.fullName,
            phone: this.profileForm.value.phone
          }).subscribe();

          this.notificationService.showSuccess('Profile updated successfully');
          this.router.navigate(['/job-seeker/profile']);
        },
        error: (err) => {
          console.error(err);
          this.notificationService.showError('Failed to update profile');
          this.isSaving = false;
        }
      })
    );
  }

  private prepareFormData() {
    const f = this.profileForm.value;

    return {
      headline: f.headline,
      summary: f.summary,
      skills: f.skills ?? [],
      portfolioLinks: f.portfolioLinks ?? [],
      preferredJobTypes: f.preferredJobTypes ?? [],
      preferredLocations: f.preferredLocations ?? [],
      education: (f.education || []).map((e: any) => ({
        ...e,
        startDate: this.formatDateForBackend(e.startDate),
        endDate: this.formatDateForBackend(e.endDate)
      })),
      experience: (f.experience || []).map((e: any) => ({
        ...e,
        startDate: this.formatDateForBackend(e.startDate),
        endDate: this.formatDateForBackend(e.endDate)
      })),
      certifications: (f.certifications || []).map((c: any) => ({
        ...c,
        issueDate: this.formatDateForBackend(c.issueDate),
        expiryDate: this.formatDateForBackend(c.expiryDate)
      }))
    };
  }

  private formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  private formatDateForBackend(date: string): string | null {
    return date || null;
  }

  cancel() {
    if (this.profileForm.dirty) {
      if (confirm('Discard unsaved changes?')) {
        this.router.navigate(['/job-seeker/profile']);
      }
    } else {
      this.router.navigate(['/job-seeker/profile']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
      if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) this.markFormGroupTouched(c);
        });
      }
    });
  }

  getEducationControls() {
    return this.educationFormArray.controls;
  }

  getExperienceControls() {
    return this.experienceFormArray.controls;
  }

  getCertificationControls() {
    return this.certificationFormArray.controls;
  }

  getTotalExperience(): string {
    const count = this.experienceFormArray.length;
    return count === 0 ? 'No experience' : `${count} position${count > 1 ? 's' : ''}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  // Add this method to your ProfileEditComponent class
downloadResume(resume: Resume): void {
  if (resume.fileUrl) {
    window.open(resume.fileUrl, '_blank');
  } else {
    this.notificationService.showError('No file URL available for this resume');
  }
}
}
