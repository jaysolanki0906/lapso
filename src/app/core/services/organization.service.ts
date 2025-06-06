import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiServiceService } from './api-service.service';

export interface Organization {
  org_id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private organizationSubject = new BehaviorSubject<Organization | null>(null);
  organization$ = this.organizationSubject.asObservable();

  constructor(private api: ApiServiceService) {}

  fetchAndStoreOrganization(): Observable<Organization> {
    return this.api.get<Organization>('organization').pipe(
      tap(org => this.organizationSubject.next(org))
    );
  }

  get organization(): Organization | null {
    return this.organizationSubject.value;
  }

  setOrganization(org: Organization) {
    this.organizationSubject.next(org);
  }

  clearOrganization() {
    this.organizationSubject.next(null);
  }
}