import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
    return this.api.get<any[]>('organization').pipe(
      map(orgs => {
        const org = orgs[0];
        return {
          org_id: org.org_id,
          name: org.org_details?.org_name || ''
        } as Organization;
      }),
      tap(org => this.organizationSubject.next(org))
    );
  }

  get organization(): Organization | null {
    return this.organizationSubject.value;
  }

  setOrganization(org: Organization) {
    this.organizationSubject.next(org);
  }
  fetchorginizationid(): Observable<string> {
    return this.organization$.pipe(
      map(org => org ? org.org_id : '')
    );
  }

  clearOrganization() {
    this.organizationSubject.next(null);
  }
}