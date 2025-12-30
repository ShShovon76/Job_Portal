import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicPagesRoutingModule } from './public-pages-routing.module';
import { PublicPagesComponent } from './public-pages.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobListComponent } from './job-list/job-list.component';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [
    PublicPagesComponent,
    JobDetailsComponent,
    CompanyListComponent,
    CompanyDetailsComponent,
    ReviewsComponent,
    AboutComponent,
    HomeComponent,
    ContactComponent,
    JobListComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    PublicPagesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  
  ]
})
export class PublicPagesModule { }
