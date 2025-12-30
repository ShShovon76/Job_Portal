import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationStatus } from 'src/app/models/job-application.model';


@Component({
  selector: 'app-job-application-table',
  templateUrl: './job-application-table.component.html',
  styleUrls: ['./job-application-table.component.scss']
})
export class JobApplicationTableComponent {
  @Input() applications: any[] = [];
  @Input() loading = false;
  @Input() selectedApplications: Set<number> = new Set();
  @Input() viewMode: 'list' | 'grid' = 'list';
  
  @Output() statusChange = new EventEmitter<{applicationId: number, status: ApplicationStatus}>();
  @Output() profileView = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<number>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  
  ApplicationStatus = ApplicationStatus;
  statusOptions = Object.values(ApplicationStatus);
  
  getStatusClass(status: ApplicationStatus): string {
    const classes: { [key: string]: string } = {
      'APPLIED': 'bg-blue-100 text-blue-800',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
      'SHORTLISTED': 'bg-purple-100 text-purple-800',
      'INTERVIEW': 'bg-green-100 text-green-800',
      'OFFERED': 'bg-teal-100 text-teal-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
