import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of, forkJoin, from } from 'rxjs';
import { catchError, map, tap} from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { OrganizationService } from '../services/organization.service';
import { RolePermissionService } from '../services/role-permission.service';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate {
  constructor(
    private token: TokenService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private rolePermissionService: RolePermissionService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    const accessToken = this.token.getAccessToken();

    if (!accessToken) {
      this.router.navigate(['login']);
      return of(false);
    }

    const userProfile = this.userService.userProfile;
    const organization = this.organizationService.organization;

    const needsUserProfile = !userProfile;
    const needsOrganization = !organization;

    if (!needsUserProfile && !needsOrganization) {
      return of(true);
    }

    const requests = [];

    if (needsUserProfile) {
      requests.push(
        this.userService.fetchAndStoreProfile().pipe(
          tap((profile:any) => {
            this.rolePermissionService.setRole(profile.role, profile.auth_items);
          })
        )
      );
    }

    if (needsOrganization) {
      requests.push(this.organizationService.fetchAndStoreOrganization());
    }

    return forkJoin(requests).pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['login']);
        return of(false);
      })
    );
  }
}
