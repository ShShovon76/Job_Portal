

export interface Notification {
    id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}
export enum NotificationType {
  APPLICATION_UPDATE = 'APPLICATION_UPDATE',
  NEW_JOB_POST = 'NEW_JOB_POST',
  PROFILE_VIEWED = 'PROFILE_VIEWED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}