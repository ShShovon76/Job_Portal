import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobSeekerRoutingModule } from './job-seeker-routing.module';
import { JobSeekerComponent } from './job-seeker.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ResumeUploadComponent } from './resume-upload/resume-upload.component';
import { AppliedJobsComponent } from './applied-jobs/applied-jobs.component';
import { SavedJobsComponent } from './saved-jobs/saved-jobs.component';
import { JobRecommendationsComponent } from './job-recommendations/job-recommendations.component';
import { JobAlertsComponent } from './job-alerts/job-alerts.component';
import { JobFormComponent } from './job-form/job-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';
import { FileSizePipe } from 'src/app/pipes/file-size.pipe';


@NgModule({
  declarations: [
    JobSeekerComponent,
    DashboardComponent,
    ProfileComponent,
    EditProfileComponent,
    ResumeUploadComponent,
    AppliedJobsComponent,
    SavedJobsComponent,
    JobRecommendationsComponent,
    JobAlertsComponent,
    JobFormComponent,
     TruncatePipe,
    FileSizePipe
  ],
  imports: [
    CommonModule,
    JobSeekerRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class JobSeekerModule { }
