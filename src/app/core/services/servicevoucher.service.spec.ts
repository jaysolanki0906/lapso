import { TestBed } from '@angular/core/testing';

import { ServicevoucherService } from './servicevoucher.service';

describe('ServicevoucherService', () => {
  let service: ServicevoucherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicevoucherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
