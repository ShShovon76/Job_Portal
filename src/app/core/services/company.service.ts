import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Company, CompanyListQuery } from 'src/app/models/company.model';
import { Pagination } from 'src/app/models/pagination.model';
import { map, Observable } from 'rxjs';
import { CompanyReview } from 'src/app/models/company-review.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(private api: ApiService) {}

    private mapSpringPageToPagination<T>(springPage: any): Pagination<T> {
    return {
      items: springPage.content || [],
      totalItems: springPage.totalElements || 0,
      page: springPage.number || 0,
      size: springPage.size || 20,
      totalPages: springPage.totalPages || 0
    };
  }

 // Update all methods that return paginated data
  list(query: CompanyListQuery = {}): Observable<Pagination<Company>> {
    const hasFilters = query.keyword || query.industry || query.verified !== undefined;
    const path = hasFilters ? '/companies/search' : '/companies';
    
    const params = this.api.buildParams(query);
    
    return this.api.get<any>(path, params).pipe(
      map(response => this.mapSpringPageToPagination<Company>(response))
    );
  }


  get(companyId: number): Observable<Company> {
    return this.api.get<Company>(`/companies/${companyId}`);
  }

  postReview(companyId: number, payload: { rating: number; title: string; comment: string }) {
    return this.api.post(`/companies/${companyId}/reviews`, payload);
  }

 listReviews(companyId: number, query: { page?: number; size?: number } = {}): Observable<Pagination<CompanyReview>> {
    const params = this.api.buildParams(query);
    
    return this.api.get<any>(`/companies/${companyId}/reviews`, params).pipe(
      map(response => this.mapSpringPageToPagination<CompanyReview>(response))
    );
  }

    create(ownerId: number, payload: Partial<Company>): Observable<Company> {
    // Add ownerId as query parameter
    const params = this.api.buildParams({ ownerId });
    return this.api.post<Company>('/companies', payload, params);
  }

  update(id: number, ownerId: number, payload: Partial<Company>): Observable<Company> {
    const params = this.api.buildParams({ ownerId });
    return this.api.put<Company>(`/companies/${id}`, payload, params);
  }

  delete(id: number, ownerId: number): Observable<void> {
    const params = this.api.buildParams({ ownerId });
    return this.api.delete<void>(`/companies/${id}`, params);
  }

  verifyCompany(id: number, adminId: number): Observable<void> {
    const params = this.api.buildParams({ adminId });
    return this.api.post<void>(`/companies/${id}/verify`, null, params);
  }

  // Add missing methods
   getCompaniesByOwner(ownerId: number, query: { page?: number; size?: number } = {}): Observable<Pagination<Company>> {
    const params = this.api.buildParams({ ...query });
    
    return this.api.get<any>(`/companies/owner/${ownerId}`, params).pipe(
      map(response => this.mapSpringPageToPagination<Company>(response))
    );
  }

 
addReview(
  companyId: number, 
  reviewData: { rating: number; title: string; comment: string }, 
  reviewerId: number
): Observable<CompanyReview> {
  // Backend expects reviewerId as a @RequestParam
  const params = this.api.buildParams({ reviewerId });
  return this.api.post<CompanyReview>(`/companies/${companyId}/reviews`, reviewData, params);
}
}
