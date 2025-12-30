export interface JobView {
  id: number;
  jobId: number;
  viewerId?: number;
  ipAddress?: string;
  userAgent?: string;
  viewDate: Date;
}