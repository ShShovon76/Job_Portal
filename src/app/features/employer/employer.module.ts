import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployerRoutingModule } from './employer-routing.module';
import { EmployerComponent } from './employer.component';
import { EmployerDashboardComponent } from './employer-dashboard/employer-dashboard.component';
import { PostJobComponent } from './post-job/post-job.component';
import { EditJobComponent } from './edit-job/edit-job.component';
import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';
import { ViewApplicantsComponent } from './view-applicants/view-applicants.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { CompanyProfileEditComponent } from './company-profile-edit/company-profile-edit.component';
import { CompanyReviewsComponent } from './company-reviews/company-reviews.component';
import { NgChartsModule } from 'ng2-charts';
import { JobApplicationTableComponent } from './job-application-table/job-application-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplicantProfileComponent } from './applicant-profile/applicant-profile.component';


@NgModule({
  declarations: [
    EmployerComponent,
    EmployerDashboardComponent,
    PostJobComponent,
    EditJobComponent,
    ManageJobsComponent,
    ViewApplicantsComponent,
    CompanyProfileComponent,
    CompanyProfileEditComponent,
    CompanyReviewsComponent,
    JobApplicationTableComponent,
    ApplicantProfileComponent
  ],
  imports: [
    CommonModule,
    EmployerRoutingModule,
    NgChartsModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class EmployerModule { }
