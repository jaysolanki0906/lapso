import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
// import { TokenService } from './core/services/token.service';
// import { UserService } from './core/services/user.service';
// import { OrganizationService } from './core/services/organization.service';
// import { RolePermissionService } from './core/services/role-permission.service';
import { map, catchError } from 'rxjs/operators';
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
    if (this.token.getAccessToken()) {
      return forkJoin([
        this.userService.fetchAndStoreProfile().pipe(
          map((profile:any) => {
            this.rolePermissionService.setRole(profile.role, profile.auth_items);
          }),
          catchError(() => of(null))
        ),
        this.organizationService.fetchAndStoreOrganization().pipe(
          catchError(() => of(null))
        )
      ]).pipe(
        map(() => true)
      );
    } else {
      // Optionally redirect to login
      this.router.navigate(['/login']);
      return of(false);
    }
  }
}