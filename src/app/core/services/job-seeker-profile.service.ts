import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { JobSeekerProfile } from 'src/app/models/jobseeker-profile.model';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination.model';
import { Education } from 'src/app/models/education.model';
import { Experience } from 'src/app/models/experience.model';
import { Certification } from 'src/app/models/certification.model';

@Injectable({
  providedIn: 'root'
})
export class JobSeekerProfileService {
  
  constructor(private api: ApiService) {}

  // Get profile by user ID
  getProfileByUserId(userId: number): Observable<JobSeekerProfile> {
    return this.api.get<JobSeekerProfile>(`/job-seekers/profile/${userId}`);
  }

  // Search profiles
  searchProfiles(keyword?: string, page: number = 0, size: number = 10): Observable<Pagination<JobSeekerProfile>> {
    const params = this.api.buildParams({ keyword, page, size });
    return this.api.get<Pagination<JobSeekerProfile>>('/job-seekers/search', params);
  }

  // Create or update profile
  createOrUpdateProfile(userId: number, profileData: Partial<JobSeekerProfile>): Observable<JobSeekerProfile> {
    return this.api.post<JobSeekerProfile>(`/job-seekers/profile/${userId}`, profileData);
  }

  // Add education
  addEducation(userId: number, education: Omit<Education, 'id'>): Observable<Education> {
    return this.api.post<Education>(`/job-seekers/${userId}/education`, education);
  }

  // Update education
  updateEducation(userId: number, educationId: number, education: Partial<Education>): Observable<Education> {
    return this.api.put<Education>(`/job-seekers/${userId}/education/${educationId}`, education);
  }

  // Remove education
  removeEducation(userId: number, educationId: number): Observable<void> {
    return this.api.delete<void>(`/job-seekers/${userId}/education/${educationId}`);
  }

  // Get all educations for user
  getEducations(userId: number): Observable<Education[]> {
    return this.api.get<Education[]>(`/job-seekers/${userId}/education`);
  }

  // Add experience
  addExperience(userId: number, experience: Omit<Experience, 'id'>): Observable<Experience> {
    return this.api.post<Experience>(`/job-seekers/${userId}/experience`, experience);
  }

  // Update experience
  updateExperience(userId: number, experienceId: number, experience: Partial<Experience>): Observable<Experience> {
    return this.api.put<Experience>(`/job-seekers/${userId}/experience/${experienceId}`, experience);
  }

  // Remove experience
  removeExperience(userId: number, experienceId: number): Observable<void> {
    return this.api.delete<void>(`/job-seekers/${userId}/experience/${experienceId}`);
  }

  // Get all experiences for user
  getExperiences(userId: number): Observable<Experience[]> {
    return this.api.get<Experience[]>(`/job-seekers/${userId}/experience`);
  }

  // Add certification
  addCertification(userId: number, certification: Omit<Certification, 'id'>): Observable<Certification> {
    return this.api.post<Certification>(`/job-seekers/${userId}/certifications`, certification);
  }

  // Update certification
  updateCertification(userId: number, certificationId: number, certification: Partial<Certification>): Observable<Certification> {
    return this.api.put<Certification>(`/job-seekers/${userId}/certifications/${certificationId}`, certification);
  }

  // Remove certification
  removeCertification(userId: number, certificationId: number): Observable<void> {
    return this.api.delete<void>(`/job-seekers/${userId}/certifications/${certificationId}`);
  }

  // Get all certifications for user
  getCertifications(userId: number): Observable<Certification[]> {
    return this.api.get<Certification[]>(`/job-seekers/${userId}/certifications`);
  }

  // Update resume URL
  updateResumeUrl(userId: number, resumeUrl: string): Observable<void> {
    const params = this.api.buildParams({ resumeUrl });
    return this.api.put<void>(`/job-seekers/${userId}/resume`, null, params);
  }

  // Upload resume file and update URL
  uploadResume(userId: number, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.api.post<{ url: string }>(`/job-seekers/${userId}/upload-resume`, formData);
  }

  // Calculate profile completeness percentage
  getProfileCompleteness(userId: number): Observable<{ percentage: number; missingFields: string[] }> {
    return this.api.get<{ percentage: number; missingFields: string[] }>(`/job-seekers/${userId}/completeness`);
  }

  // Get profile stats
  getProfileStats(userId: number): Observable<{
    totalApplications: number;
    interviewsScheduled: number;
    offersReceived: number;
    profileViews: number;
  }> {
    return this.api.get<any>(`/job-seekers/${userId}/stats`);
  }

  // Get popular skills from all profiles
  getPopularSkills(limit: number = 10): Observable<string[]> {
    const params = this.api.buildParams({ limit });
    return this.api.get<string[]>('/job-seekers/popular-skills', params);
  }

  // Search profiles by skill
  searchProfilesBySkill(skill: string, page: number = 0, size: number = 10): Observable<Pagination<JobSeekerProfile>> {
    const params = this.api.buildParams({ skill, page, size });
    return this.api.get<Pagination<JobSeekerProfile>>('/job-seekers/search/skill', params);
  }

  // Search profiles by location
  searchProfilesByLocation(location: string, page: number = 0, size: number = 10): Observable<Pagination<JobSeekerProfile>> {
    const params = this.api.buildParams({ location, page, size });
    return this.api.get<Pagination<JobSeekerProfile>>('/job-seekers/search/location', params);
  }

  // Search profiles by job type
  searchProfilesByJobType(jobType: string, page: number = 0, size: number = 10): Observable<Pagination<JobSeekerProfile>> {
    const params = this.api.buildParams({ jobType, page, size });
    return this.api.get<Pagination<JobSeekerProfile>>('/job-seekers/search/job-type', params);
  }
}
