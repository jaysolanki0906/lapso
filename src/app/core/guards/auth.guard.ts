import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { UserService } from '../services/user.service';
import { RolePermissionService } from '../services/role-permission.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(AuthServiceService);
  const userService = inject(UserService);
  const rolePermissionService = inject(RolePermissionService);

  const token = localStorage.getItem('access_token');
  if (token) {
      return true;
    }
  
  if (!token) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // 2. Ensure user profile is loaded
  let user = userService.userProfile;
  if (!user) {
    try {
      user = await firstValueFrom(userService.fetchAndStoreProfile());
    } catch {
      authService.logout();
      return false;
    }
  }

  // 3. Block deleted/inactive users
  if (!user || user.is_deleted || user.status !== 'ACTIVE') {
    authService.logout();
    return false;
  }

  rolePermissionService.setRole(user.role, user.auth_items);

  

  // 6. Check for required permissions (if any)
  const requiredPermissions = route.data['permissions'] as { module: string, permission?: string }[] | undefined;
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(req =>
      rolePermissionService.getPermission(req.module, req.permission)
    );
    if (!hasAllPermissions) {
      router.navigate(['/not-authorized'], { skipLocationChange: true });
      return false;
    }
  }

  // All checks passed!
  return true;
};