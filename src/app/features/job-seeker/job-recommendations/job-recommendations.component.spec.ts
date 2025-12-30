import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobRecommendationsComponent } from './job-recommendations.component';

describe('JobRecommendationsComponent', () => {
  let component: JobRecommendationsComponent;
  let fixture: ComponentFixture<JobRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobRecommendationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
