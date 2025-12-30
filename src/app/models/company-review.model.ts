export interface CompanyReview {
  id: number;
  companyId: number;
  reviewerId: number;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
}
