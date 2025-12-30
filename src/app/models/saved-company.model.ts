import { Company } from "./company.model";

export interface SavedCompany {
  id: number;
  companyId: number;
  jobSeekerId: number;
  savedAt: Date;
   company?: Company; 
}
