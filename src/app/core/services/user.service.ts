import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay } from 'rxjs/operators';
import { AuthServiceService } from './auth-service.service';
import { ApiServiceService } from './api-service.service';

export interface UserProfile {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  mobile: string;
  country_code: string;
  provider: string;
  user_type: string;
  email_verified: boolean;
  mobile_verified: boolean;
  status: string;
  tnc: any;
  last_login: string | null;
  lapso_code: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  role: string;
  auth_items: any;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  private loading$: Observable<UserProfile> | null = null;
  constructor(private api: ApiServiceService) {}
  
  fetchAndStoreProfile(): Observable<UserProfile> {
    if (!this.loading$) {
      this.loading$ = this.api.get<UserProfile>('profile').pipe(
        tap(profile => this.userProfileSubject.next(profile)),
        shareReplay(1)
      );
    }
    return this.loading$;
  }

  get userProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  setProfile(profile: UserProfile) {
    this.userProfileSubject.next(profile);
  }

  clearProfile() {
    this.userProfileSubject.next(null);
    this.loading$ = null; 
  }
  editinfo(payload: any): Observable<any>{
    return this.api.put<any>("profile", payload);
  }
  fetchorgid():Observable<any>{
    return this.api.get<any>("organization");
  }
  getuserid(): string | null {
    const profile = this.userProfileSubject.value;
    return profile ? profile.id : null;
  }
}