import { TestBed } from '@angular/core/testing';

import { OrgusersService } from './orgusers.service';

describe('OrgusersService', () => {
  let service: OrgusersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgusersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
