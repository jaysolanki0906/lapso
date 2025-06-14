import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { rolebasedGuard } from './rolebased.guard';

describe('rolebasedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => rolebasedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
