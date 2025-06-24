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

  initApp(): Promise<void> {
    return firstValueFrom(
      this.userService.fetchAndStoreProfile()
    ).then(() => undefined).catch(() => undefined); // Swallow errors silently
  }
}