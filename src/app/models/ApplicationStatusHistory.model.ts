
import { ApplicationStatus } from "./job-application.model";
import { User } from "./user.model";

// ApplicationStatusHistory (from backend)
export interface ApplicationStatusHistory {
  id: number;
  applicationId: number;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  note?: string;
  changedAt: Date;
  changedBy?: User; // Or changedByUserId
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}