export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
}
