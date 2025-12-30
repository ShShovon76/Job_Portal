import { Certification } from "./certification.model";
import { Education } from "./education.model";
import { Experience } from "./experience.model";
import { JobApplication, Resume } from "./job-application.model";
import { SavedCompany } from "./saved-company.model";
import { SavedJob } from "./saved-job.model";

export interface JobSeekerProfile {
    id: number;
  userId: number;
  headline?: string;
  summary?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  portfolioLinks: string[];
  resumes?: Resume[];
  preferredJobTypes: string[];
  preferredLocations: string[];
  applications?: JobApplication[];
  savedJobs?: SavedJob[];
  savedCompanies?: SavedCompany[];
}