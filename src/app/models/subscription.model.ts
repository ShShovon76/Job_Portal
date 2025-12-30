export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
}
