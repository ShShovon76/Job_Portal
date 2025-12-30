import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Notification } from 'src/app/models/notification.model';
import { Observable, Subject } from 'rxjs';
import { Pagination } from 'src/app/models/pagination.model';


export interface UINotification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<UINotification>();
  
  constructor(private api: ApiService) {}

  // UI Notification Methods using Subject/Observable
  showSuccess(message: string): void {
    this.notificationSubject.next({
      message,
      type: 'success',
      duration: 3000
    });
  }

  showError(message: string): void {
    this.notificationSubject.next({
      message,
      type: 'error',
      duration: 5000
    });
  }

  showWarning(message: string): void {
    this.notificationSubject.next({
      message,
      type: 'warning',
      duration: 4000
    });
  }

  showInfo(message: string): void {
    this.notificationSubject.next({
      message,
      type: 'info',
      duration: 3000
    });
  }

  // Get notification observable for components to subscribe
  getNotifications(): Observable<UINotification> {
    return this.notificationSubject.asObservable();
  }

  // Backend Notification Methods (from your existing code)
  list(userId: number, query: { page?: number; size?: number } = {}): Observable<Pagination<Notification>> {
    const params = this.api.buildParams({ userId, ...query });
    return this.api.get<Pagination<Notification>>('/api/notifications', params);
  }

  markRead(notificationId: number, userId: number): Observable<Notification> {
    return this.api.put<Notification>(
      `/api/notifications/${notificationId}/read`,
      null,
      this.api.buildParams({ userId })
    );
  }

  markAllRead(userId: number): Observable<{ count: number }> {
    return this.api.put<{ count: number }>(
      `/api/notifications/read-all`,
      null,
      this.api.buildParams({ userId })
    );
  }

  createSystemNotification(payload: Partial<Notification>): Observable<Notification> {
    return this.api.post<Notification>('/notifications', payload);
  }

  delete(notificationId: number): Observable<void> {
    return this.api.delete<void>(`/notifications/${notificationId}`);
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.api.get<number>(
      `/api/notifications/unread-count`,
      this.api.buildParams({ userId })
    );
  }
}