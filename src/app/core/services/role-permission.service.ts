import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ApiServiceService } from "./api-service.service";

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  private baseUrl = 'roles'; 
  public currentRole: string = 'USER';
  public roleAuth: any = {};

  constructor(private api: ApiServiceService) {}

  private roleSubject = new BehaviorSubject<string>('USER');
public currentRole$ = this.roleSubject.asObservable();

setRole(role: string, auth_items?: any): void {
  this.currentRole = (role || 'USER').toUpperCase();
  this.roleSubject.next(this.currentRole);
  if (auth_items) {
    this.roleAuth = auth_items || {};
  }
}

  private moduleMap: { [key: string]: string } = {
    items: 'item',
    interests: 'interest',
    users: 'user'
  };

  getPermission(module: string, permission?: string): boolean {
    const permissions = this.generatePermissions(this.roleAuth);
    const backendModule = this.moduleMap[module] || module;

    if (!permissions[backendModule]) {
      if (this.roleAuth[backendModule]) {
        const rawPermissions = Object.keys(this.roleAuth[backendModule]);
        for (const perm of rawPermissions) {
          if (this.roleAuth[backendModule][perm] === true) {
            return true;
          }
        }
      }
      console.error(
        `[RolePermissionService] Module "${backendModule}" not found in permissions for role "${this.currentRole}".`
      );
      return false;
    }

    if (!permission) {
      return permissions[backendModule].length > 0;
    }

    if (!permissions[backendModule].includes(permission)) {
      const rawPermissions = this.roleAuth[backendModule] ? Object.keys(this.roleAuth[backendModule]) : [];
      if (!rawPermissions.includes(permission)) {
        console.error(
          `[RolePermissionService] Permission "${permission}" not found in module "${backendModule}" for role "${this.currentRole}".`
        );
      }
      return false;
    }
    return true;
}
  getRoles(): Observable<any[]> {
    return this.api.get<any[]>(this.baseUrl);
  }

  createRole(payload: any): Observable<any> {
    return this.api.post<any>(this.baseUrl, payload, );
  }

  updateRole(roleId: string, payload: any): Observable<any> {
    return this.api.patch<any>(`${this.baseUrl}/${roleId}`, payload);
  }

  patchRole(roleId: string, payload: any): Observable<any> {
    return this.api.patch<any>(`${this.baseUrl}/${roleId}`, payload);
  }

  deleteRole(roleId: string): Observable<any> {
    return this.api.delete<any>(`${this.baseUrl}/${roleId}`);
  }

  setRoleAuth(authItems: any): void {
    this.roleAuth = authItems;
  }

  private generatePermissions(authItems: any): { [key: string]: string[] } {
    const permissions: { [key: string]: string[] } = {};
    for (const module of Object.keys(authItems || {})) {
      permissions[module] = [];
      for (const perm of Object.keys(authItems[module])) {
        if (authItems[module][perm] === true) {
          permissions[module].push(perm);
        }
      }
    }
    return permissions;
  }
  getpermissionallforpermissionpage(orgid:string):Observable<any>
  {
    return this.api.get(`${orgid}/org-roles`);
  }
  saverole(orgid:string,paylod:any):Observable<any>
  {
    return this.api.post(`${orgid}/org-roles`,paylod);
  }
  editroles(orgid:string,paylod:any,id:string):Observable<any>
  {
    return this.api.put(`${orgid}/org-roles/${id}`,paylod);
  }
  deleteroleandsave(orgid:string,id:string):Observable<any>{
    return this.api.delete(`${orgid}/org-roles/${id}`);
  }
  saveAllRoles(orgid:string,payload:any,id:string):Observable<any>
  {
    return this.api.put(`${orgid}/org-roles/${id}`,payload);
  }
}