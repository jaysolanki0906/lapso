import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { UserService } from '../services/user.service';
import { RolePermissionService } from '../services/role-permission.service';
import { firstValueFrom } from 'rxjs';
import { AppInitService } from '../services/app-init.service';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const appInit = inject(AppInitService);
  const authService = inject(AuthServiceService);
  const userService = inject(UserService);
  const rolePermissionService = inject(RolePermissionService);

  // 1. Check for tokens
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  if (!accessToken || !refreshToken) {
    router.navigate(['login'], { replaceUrl: true });
    return false;
  }

  // 3. Ensure user profile is loaded
  let user = userService.userProfile;
  if (!user) {
    try {
      user = await firstValueFrom(userService.fetchAndStoreProfile());
    } catch {
      authService.logout();
      return false;
    }
  }

  // 4. Block deleted/inactive users
  if (!user || user.is_deleted || user.status !== 'ACTIVE') {
    authService.logout();
    return false;
  }

  // 5. Set role/permissions
  rolePermissionService.setRole(user.role, user.auth_items);

  // 6. Check for required permissions (if any)
  const requiredPermissions = route.data['permissions'] as { module: string, permission?: string }[] | undefined;
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(req =>
      rolePermissionService.getPermission(req.module, req.permission)
    );
    if (!hasAllPermissions) {
      router.navigate(['not-authorized'], { skipLocationChange: true });
      return false;
    }
  }

  // All checks passed!
  return true;
};