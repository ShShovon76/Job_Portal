import { Job } from "./job.model";

export interface SavedJob {
  id: number;
  jobId: number;
  jobSeekerId: number;
  savedAt: Date;
   job?: Job;
}
