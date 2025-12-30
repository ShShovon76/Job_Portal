
export interface SimpleUser {
  id: number;
  fullName: string;
}

export interface SimpleCompany {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface SimpleCategory {
  id: number;
  name: string;
}

export interface Job {
  id: number;

  employer: SimpleUser;
  company: SimpleCompany;
  category: SimpleCategory;

  title: string;
  description: string;

  jobType: JobType;
  experienceLevel: ExperienceLevel;

  minSalary?: number;
  maxSalary?: number;
  salaryType: SalaryType;

  location: string;
  remoteAllowed: boolean;
  skills: string[];

  postedAt: string;   // ISO string from backend
  deadline: string;

  status: JobStatus;

  viewsCount?: number;
  applicantsCount?: number;
}
export interface CreateJobPayload {
  companyId: number;
  categoryId: number;

  title: string;
  description: string;

  jobType: JobType;
  experienceLevel: ExperienceLevel;

  minSalary?: number;
  maxSalary?: number;
  salaryType: SalaryType;

  location: string;
  remoteAllowed: boolean;
  skills: string[];

  deadline: string; // yyyy-MM-dd
}
export interface UpdateJobPayload {
  title?: string;
  description?: string;
  categoryId?: number;

  jobType?: JobType;
  experienceLevel?: ExperienceLevel;

  minSalary?: number;
  maxSalary?: number;
  salaryType?: SalaryType;

  location?: string;
  remoteAllowed?: boolean;
  skills?: string[];

  deadline?: string;
  status?: JobStatus;
}
export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE'
}
export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
  DIRECTOR = 'DIRECTOR',
  EXECUTIVE = 'EXECUTIVE'
}
export enum SalaryType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  HOURLY = 'HOURLY',
  WEEKLY = 'WEEKLY'
}
export enum JobStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT'
}
