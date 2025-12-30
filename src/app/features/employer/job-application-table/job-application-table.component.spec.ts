import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApplicationTableComponent } from './job-application-table.component';

describe('JobApplicationTableComponent', () => {
  let component: JobApplicationTableComponent;
  let fixture: ComponentFixture<JobApplicationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobApplicationTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobApplicationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
