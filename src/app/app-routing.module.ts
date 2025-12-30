import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/public-pages/public-pages.module')
        .then(m => m.PublicPagesModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  { path: 'job-seeker', 
    loadChildren: () =>
     import('./features/job-seeker/job-seeker.module').then(m => m.JobSeekerModule) },

  { path: 'employer', loadChildren: () => import('./features/employer/employer.module').then(m => m.EmployerModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
