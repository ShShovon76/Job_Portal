import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SubscriptionPlan } from 'src/app/models/subscription-plan.model';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  constructor(private api: ApiService) {}

  getAllPlans(): Observable<SubscriptionPlan[]> {
    return this.api.get<SubscriptionPlan[]>('/api/subscription-plans/all');
  }

  getActivePlans(): Observable<SubscriptionPlan[]> {
    return this.api.get<SubscriptionPlan[]>('/api/subscription-plans/active');
  }

  getPlans(query: { page?: number; size?: number } = {}): Observable<Pagination<SubscriptionPlan>> {
    const params = this.api.buildParams(query);
    return this.api.get<Pagination<SubscriptionPlan>>('/api/subscription-plans', params);
  }

  getPlanById(id: number): Observable<SubscriptionPlan> {
    return this.api.get<SubscriptionPlan>(`/api/subscription-plans/${id}`);
  }

  createPlan(plan: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    return this.api.post<SubscriptionPlan>('/api/subscription-plans', plan);
  }

  updatePlan(id: number, plan: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    return this.api.put<SubscriptionPlan>(`/api/subscription-plans/${id}`, plan);
  }

  activatePlan(id: number, active: boolean): Observable<void> {
    return this.api.put<void>(`/api/subscription-plans/${id}/activate`, null, this.api.buildParams({ active }));
  }

  deletePlan(id: number): Observable<void> {
    return this.api.delete<void>(`/api/subscription-plans/${id}`);
  }
}