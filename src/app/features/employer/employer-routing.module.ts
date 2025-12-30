import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployerDashboardComponent } from './employer-dashboard/employer-dashboard.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { UserRole } from 'src/app/models/user.model';
import { PostJobComponent } from './post-job/post-job.component';
import { EditJobComponent } from './edit-job/edit-job.component';
import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';
import { ViewApplicantsComponent } from './view-applicants/view-applicants.component';
import { ApplicantProfileComponent } from './applicant-profile/applicant-profile.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { CompanyProfileEditComponent } from './company-profile-edit/company-profile-edit.component';
import { CompanyReviewsComponent } from './company-reviews/company-reviews.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  { 
    path: 'dashboard', 
    component: EmployerDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER, UserRole.ADMIN] }
  },
  { 
    path: 'post-job', 
    component: PostJobComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  },
  { 
    path: 'edit-job/:id', 
    component: EditJobComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  },
  { 
    path: 'manage-jobs', 
    component: ManageJobsComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  },
  { 
    path: 'applicants/:jobId', 
    component: ViewApplicantsComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  },
  { 
    path: 'applicant/:id', 
    component: ApplicantProfileComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  },
  { 
    path: 'company-profile', 
    component: CompanyProfileComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  },
  { 
    path: 'company-profile/edit', 
    component: CompanyProfileEditComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  },
  { 
    path: 'company-reviews', 
    component: CompanyReviewsComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.EMPLOYER] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployerRoutingModule { }
