import { TestBed } from '@angular/core/testing';

import { ServicecallService } from './servicecall.service';

describe('ServicecallService', () => {
  let service: ServicecallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicecallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
