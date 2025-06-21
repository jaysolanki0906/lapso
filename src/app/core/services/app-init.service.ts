import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { RolePermissionService } from './role-permission.service';
import { OrganizationService } from './organization.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  constructor(
    private userService: UserService,
    private rolePermissionService: RolePermissionService,
    private organizationService: OrganizationService
  ) {}

  async initApp(): Promise<void> {
  //   if(localStorage.getItem('access_token')){
  //   const profile = await firstValueFrom(
  //     this.userService.fetchAndStoreProfile()
  //   );
  //   this.rolePermissionService.setRole(profile.role, profile.auth_items);
  //   await firstValueFrom(this.organizationService.fetchAndStoreOrganization());
  // }
}
}