import { ExperienceLevel, JobType } from "./job.model";


export interface JobSearchFilter {
  keyword?: string;
  location?: string;
  categoryId?: number;
  jobType?: JobType;
  salaryRange?: SalaryRange;
  experienceLevel?: ExperienceLevel;
  remote?: boolean;
  page?: number;      
  size?: number;   
   companyId?: number;
     
}

export interface SalaryRange {
  min?: number;      
  max?: number;      
}