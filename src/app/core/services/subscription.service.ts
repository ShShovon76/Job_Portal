import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SubscriptionPlan } from 'src/app/models/subscription-plan.model';
import { Subscription } from 'src/app/models/subscription.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private api: ApiService) {}

  getUserSubscription(userId: number): Observable<Subscription> {
    return this.api.get<Subscription>(`/api/subscriptions/user/${userId}`);
  }

  getActiveSubscription(userId: number): Observable<Subscription> {
    return this.api.get<Subscription>(`/api/subscriptions/user/${userId}/active`);
  }

  hasActiveSubscription(userId: number): Observable<boolean> {
    return this.api.get<boolean>(`/api/subscriptions/user/${userId}/has-active`);
  }

  createSubscription(userId: number, planId: number, stripeSubscriptionId: string, stripeCustomerId: string): Observable<Subscription> {
    const params = this.api.buildParams({ userId, planId, stripeSubscriptionId, stripeCustomerId });
    return this.api.post<Subscription>('/api/subscriptions', null, params);
  }

  cancelSubscription(subscriptionId: number, userId: number): Observable<Subscription> {
    const params = this.api.buildParams({ userId });
    return this.api.put<Subscription>(`/api/subscriptions/${subscriptionId}/cancel`, null, params);
  }

  renewSubscription(subscriptionId: number): Observable<Subscription> {
    return this.api.put<Subscription>(`/api/subscriptions/${subscriptionId}/renew`, null);
  }

  updateSubscriptionStatus(stripeSubscriptionId: string, active: boolean): Observable<void> {
    const params = this.api.buildParams({ stripeSubscriptionId, active });
    return this.api.put<void>('/api/subscriptions/status', null, params);
  }

  getExpiringSubscriptions(daysBeforeExpiry: number = 7): Observable<Subscription[]> {
    const params = this.api.buildParams({ daysBeforeExpiry });
    return this.api.get<Subscription[]>('/api/subscriptions/expiring', params);
  }
}
