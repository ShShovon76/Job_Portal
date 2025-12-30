import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { JobFormComponent } from './job-form/job-form.component';
import { ResumeUploadComponent } from './resume-upload/resume-upload.component';
import { AppliedJobsComponent } from './applied-jobs/applied-jobs.component';
import { SavedJobsComponent } from './saved-jobs/saved-jobs.component';
import { JobRecommendationsComponent } from './job-recommendations/job-recommendations.component';
import { JobAlertsComponent } from './job-alerts/job-alerts.component';
import { ProfileComponent } from './profile/profile.component';


const routes: Routes = [
    { 
    path: '',  // This matches /job-seeker
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  { 
    path: 'dashboard',  // This becomes /job-seeker/dashboard
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'profile/edit', 
    component: EditProfileComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'job-form',  // Fixed: Added missing closing quote
    component: JobFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'resume-upload', 
    component: ResumeUploadComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'applied-jobs', 
    component: AppliedJobsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'saved-jobs', 
    component: SavedJobsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'job-recommendations', 
    component: JobRecommendationsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  },
  { 
    path: 'job-alerts', 
    component: JobAlertsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['JOB_SEEKER'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobSeekerRoutingModule { }
