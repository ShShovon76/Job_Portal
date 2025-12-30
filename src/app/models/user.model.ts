export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYER = 'EMPLOYER',
  JOB_SEEKER = 'JOB_SEEKER'
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: UserRole;
  profilePictureUrl?: string;
  createdAt?: Date;
  enabled?: boolean;
}