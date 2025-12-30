import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SavedCompany } from 'src/app/models/saved-company.model';
import { Pagination } from 'src/app/models/pagination.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavedCompanyService {
  constructor(private api: ApiService) {}

  getSavedCompanies(jobSeekerId: number, query: { page?: number; size?: number } = {}): Observable<Pagination<SavedCompany>> {
    const params = this.api.buildParams({ ...query, jobSeekerId });
    return this.api.get<Pagination<SavedCompany>>('/saved-companies', params);
  }

  isCompanySaved(companyId: number, jobSeekerId: number): Observable<boolean> {
    return this.api.get<boolean>('/saved-companies/check', this.api.buildParams({ companyId, jobSeekerId }));
  }

  saveCompany(companyId: number, jobSeekerId: number): Observable<SavedCompany> {
    return this.api.post<SavedCompany>('/saved-companies', null, this.api.buildParams({ companyId, jobSeekerId }));
  }

  unsaveCompany(companyId: number, jobSeekerId: number): Observable<void> {
    return this.api.delete<void>('/saved-companies/unsave', this.api.buildParams({ companyId, jobSeekerId }));
  }

  unsaveCompanyById(savedCompanyId: number, jobSeekerId: number): Observable<void> {
    return this.api.delete<void>(`/saved-companies/${savedCompanyId}`, this.api.buildParams({ jobSeekerId }));
  }

  getSaveCountForCompany(companyId: number): Observable<number> {
    return this.api.get<number>(`/saved-companies/${companyId}/count`);
  }
  
  searchUsers(query: { keyword?: string; role?: string; page?: number; size?: number }) {
  return this.api.get(`/users/search`, this.api.buildParams(query));
}

}
