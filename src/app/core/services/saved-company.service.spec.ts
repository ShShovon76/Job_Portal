import { TestBed } from '@angular/core/testing';

import { SavedCompanyService } from './saved-company.service';

describe('SavedCompanyService', () => {
  let service: SavedCompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedCompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
