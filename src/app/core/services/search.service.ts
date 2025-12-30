import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Job } from 'src/app/models/job.model';
import { Company } from 'src/app/models/company.model';
import { Pagination } from 'src/app/models/pagination.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private api: ApiService) {}

  // Use POST with body as backend expects
  searchJobs(filter: any): Observable<Pagination<Job>> {
    return this.api.post<Pagination<Job>>('/search/jobs', filter);
  }

  searchCompanies(query: Record<string, any> = {}): Observable<Pagination<Company>> {
    const params = this.api.buildParams(query);
    return this.api.get<Pagination<Company>>('/search/companies', params);
  }

  autocompleteJobTitles(keyword: string, limit: number = 10): Observable<string[]> {
    const params = this.api.buildParams({ keyword, limit });
    return this.api.get<string[]>('/search/autocomplete/job-titles', params);
  }

  autocompleteCompanies(keyword: string, limit: number = 10): Observable<string[]> {
    const params = this.api.buildParams({ keyword, limit });
    return this.api.get<string[]>('/search/autocomplete/companies', params);
  }

  getAllCategories(): Observable<any[]> { // Update with actual interface
    return this.api.get<any[]>('/search/categories');
  }

  getPopularSkills(limit: number = 10): Observable<string[]> {
    const params = this.api.buildParams({ limit });
    return this.api.get<string[]>('/search/popular-skills', params);
  }
}
