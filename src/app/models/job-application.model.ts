

export interface JobApplication {
  id: number;

  jobId: number;
  jobTitle?: string;
  companyName?: string;

  jobSeekerId: number;
  jobSeekerName?: string;
  jobSeekerEmail?: string;
  jobSeekerProfilePicture?: string;

  resumeId?: number;
  resumeUrl?: string;
  resumeTitle?: string;

  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
}



export interface Resume {
  id: number;
  title: string;
  fileUrl: string;
  uploadedAt: string;
  primaryResume: boolean;
}
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

