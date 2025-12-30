import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from 'src/app/models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getUser(userId: number): Observable<User> {
    return this.api.get<User>(`/users/${userId}`);
  }

  searchUsers(query: { q?: string; role?: string; page?: number; size?: number }) {
    const params = this.api.buildParams(query);
    return this.api.get<{ items: User[]; totalItems: number }>(`/users`, params);
  }

  updateUser(userId: number, payload: Partial<User>) {
    return this.api.put<User>(`/users/${userId}`, payload);
  }

  changePassword(userId: number, payload: { currentPassword: string; newPassword: string }) {
    return this.api.post(`/users/${userId}/change-password`, payload);
  }

  uploadProfilePicture(userId: number, file: File) {
  const form = new FormData();
  form.append('file', file);

  return this.api.post(`/users/${userId}/profile-picture`, form);
}

}
