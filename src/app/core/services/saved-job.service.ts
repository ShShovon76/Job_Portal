import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SavedJob } from 'src/app/models/saved-job.model';
import { Pagination } from 'src/app/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class SavedJobService {
  constructor(private api: ApiService) {}

  getSavedJobs(query: { page?: number; size?: number } = {}) {
  return this.api.get<Pagination<SavedJob>>(
    '/saved-jobs',
    this.api.buildParams(query)
  );
}



  isJobSaved(jobId: number, userId: number): Observable<boolean> {
    return this.api.get<boolean>('/saved-jobs/check', this.api.buildParams({ jobId, userId }));
  }

  saveJob(jobId: number, userId: number): Observable<SavedJob> {
    return this.api.post<SavedJob>('/saved-jobs', null, this.api.buildParams({ jobId, userId }));
  }

  unsaveJob(jobId: number, userId: number): Observable<void> {
    return this.api.delete<void>('/saved-jobs/unsave', this.api.buildParams({ jobId, userId }));
  }

 unsaveJobById(savedJobId: number, userId: number) {
  return this.api.delete<void>(
    `/saved-jobs/${savedJobId}`,
    this.api.buildParams({ userId })
  );
}


  getSaveCountForJob(jobId: number): Observable<number> {
    return this.api.get<number>(`/saved-jobs/${jobId}/count`);
  }
}
