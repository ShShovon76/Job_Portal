export interface DailyApplicationCount {
  date: Date;
  count: number;
}

export interface DailyViewCount {
  date: Date;
  count: number;
}

export interface JobViewStats {
  jobId: number;
  jobTitle: string;
  views: number;
  applicants: number;
}

export interface JobViewsResponse {
  jobId: number;
  jobTitle: string;
  companyName: string;
  totalViews: number;
  uniqueViews: number;
  fromDate: Date;
  toDate: Date;
  dailyViews: DailyViewCount[];
}

export interface ApplicationTrendsResponse {
  jobId?: number;
  jobTitle?: string;
  employerId?: number;
  employerName?: string;
  targetName: string;
  fromDate: Date;
  toDate: Date;
  dailyApplications: DailyApplicationCount[];
  totalApplications: number;
  statusBreakdown: { [key: string]: number };
}

export interface EmployerDashboardResponse {
  employerId: number;
  employerName: string;
  companyName: string;
  totalJobs: number;
  activeJobs: number;
  profileViews: number;
  totalApplications: number;
  recentApplications: number;
  topViewedJobs: JobViewStats[];
  applicationStatusBreakdown: { [key: string]: number };
  hasActiveSubscription: boolean;
}

export interface JobCategoryStats {
  categoryId: number;
  categoryName: string;
  jobCount: number;
}

export interface SiteMetricsResponse {
  timestamp: Date;
  // User metrics
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: { [key: string]: number };
  // Job metrics
  totalJobs: number;
  activeJobs: number;
  jobsPostedToday: number;
  jobsPostedThisWeek: number;
  // Company metrics
  totalCompanies: number;
  verifiedCompanies: number;
  companiesCreatedToday: number;
  // Application metrics
  totalApplications: number;
  applicationsToday: number;
  applicationsThisWeek: number;
  // Subscription metrics
  activeSubscriptions: number;
  subscriptionsToday: number;
  // Category metrics
  popularCategories: JobCategoryStats[];
}

export interface JobSeekerDashboardResponse {
  jobSeekerId: number;
  fullName: string;

  totalApplications: number;
  applicationsLast30Days: number;

  applicationStatusBreakdown: {
    [status: string]: number;
  };

  recentApplications: {
    jobId: number;
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
  }[];
}

export interface JobAnalytics {
  jobId: number;
  title: string;

  totalViews: number;
  uniqueViews: number;
  totalApplications: number;

  lastViewedAt: string; // or Date
}
