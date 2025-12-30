import { TestBed } from '@angular/core/testing';

import { EnumsServiceService } from './enums-service.service';

describe('EnumsServiceService', () => {
  let service: EnumsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnumsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
