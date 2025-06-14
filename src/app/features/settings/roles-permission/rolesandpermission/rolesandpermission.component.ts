import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import Swal from 'sweetalert2';
import { OrganizationService } from '../../../../core/services/organization.service';
import { RolePermissionService } from '../../../../core/services/role-permission.service';
import { RoleandpermissionformComponent } from '../roleandpermissionform/roleandpermissionform.component';

interface Permission {
  id: string;
  label: string;
  enabled: boolean;
  children?: Permission[];
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  editable: boolean;
}

interface SidebarItem {
  icon: string;
  label: string;
  active: boolean;
  route?: string;
  
}

type FormMode = 'add' | 'edit';

@Component({
  selector: 'app-role-permission-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RoleandpermissionformComponent],
  templateUrl: './rolesandpermission.component.html',
  styleUrl: './rolesandpermission.component.scss'
})
export class RolesandpermissionComponent implements OnInit {
  isRoleFormOpen = false;
  formMode: FormMode = 'add';
  selectedRole: Role | null = null;
  roleName: string = '';
  rolePermissions: string[] = [];
  orgid: string = '';
  isOffcanvasOpen = false;
  userFormModel = { id:'',fullName: '' };

  sidebarItems: SidebarItem[] = [
    { icon: '👥', label: 'Organization', active: false, route: 'settings/organization' },
    { icon: '🛒', label: 'Configuration', active: false, route: 'settings/configuration' },
    { icon: '👤', label: 'User Management', active: false, route: 'settings/user-management' },
    { icon: '💬', label: 'Role & Permission', active: true, route: 'settings/role-permission-management' }
  ];

  roles: Role[] = [];
  permissions: Permission[] = [];
  expandedPermissions: Set<string> = new Set();

  // For sidebar role titles
  sidebarRoleTitles: string[] = [];

  constructor(
    private router: Router,
    private err: ErrorHandlerService,
    private roleService: RolePermissionService,
    private org: OrganizationService
  ) {}

  ngOnInit(): void {
    this.fetchorgid();
  }

  fetchorgid() {
    this.org.fetchorginizationid().subscribe(arg => {
      if (!arg) return;
      this.orgid = arg;
      this.loadroles();
    });
  }

  loadroles() {
    this.roleService.getpermissionallforpermissionpage(this.orgid).subscribe((rolesApi: any[]) => {
      const baseAuthItems = rolesApi[0]?.auth_items || {};
      this.permissions = Object.keys(baseAuthItems).map(parentKey => ({
        id: parentKey,
        label: this.toLabel(parentKey),
        enabled: false,
        children: Object.keys(baseAuthItems[parentKey] || {}).map(childKey => ({
          id: childKey,
          label: this.toLabel(childKey),
          enabled: false
        }))
      }));

      this.roles = rolesApi.map(role => ({
        id: role.id,
        name: role.title,
        permissions: Object.values(role.auth_items)
          .flatMap((perm: any) => Object.keys(perm).filter(key => perm[key]))
          .sort(),
        editable: role.title !== 'Admin'
      }));

      this.sidebarRoleTitles = this.roles.map(r => r.name);

      const executive = this.roles.find(r => r.name === 'Admin');
      if (executive) {
        this.onSelectRole(executive);
      } else if (this.roles.length > 0) {
        this.onSelectRole(this.roles[0]);
      }
    });
  }

  // Select a role and update UI permissions
  onSelectRole(role: Role) {
    this.selectedRole = role;
    this.rolePermissions = [...role.permissions];
    this.updatePermissionUI();
  }
  private updatePermissionUI() {
    this.permissions.forEach(parent => {
      parent.enabled = parent.children
        ? parent.children.every(child => this.rolePermissions.includes(child.id))
        : this.rolePermissions.includes(parent.id);
      if (parent.children) {
        parent.children.forEach(child => {
          child.enabled = this.rolePermissions.includes(child.id);
        });
      }
    });
  }

  handleSave(user: any) {
    // handle save logic (add/edit role)
    this.isOffcanvasOpen = false;
    this.loadroles();
  }

  isParentOrAnyChildSelected(perm: Permission): boolean {
    if (perm.enabled) return true;
    if (perm.children) return perm.children.some(child => child.enabled);
    return false;
  }

  isRoleSelected(roleName: string): boolean {
    return this.selectedRole?.name === roleName;
  }

  isParentIndeterminate(perm: Permission): boolean {
    if (!perm.enabled && perm.children) {
      return perm.children.some(child => child.enabled);
    }
    return false;
  }

  onRoleItemClick(roleName: string) {
    const foundRole = this.roles.find(r => r.name === roleName);
    if (foundRole) {
      this.onSelectRole(foundRole);
    }
  }

  toLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  onSidebarItemClick(index: number): void {
    this.sidebarItems.forEach((item, i) => {
      item.active = i === index;
    });
    const selectedItem = this.sidebarItems[index];
    if (selectedItem.route) {
      this.router.navigate([selectedItem.route]);
    }
  }

  togglePermissionExpand(permissionId: string): void {
    if (this.expandedPermissions.has(permissionId)) {
      this.expandedPermissions.delete(permissionId);
    } else {
      this.expandedPermissions.add(permissionId);
    }
  }

  onPermissionChange(permission: Permission, event: any): void {
    const isChecked = event.target.checked;
    permission.enabled = isChecked;
    if (permission.children) {
      permission.children.forEach(child => {
        child.enabled = isChecked;
      });
    }
  }

  onChildPermissionChange(parent: Permission, child: Permission, event: any): void {
    const isChecked = event.target.checked;
    child.enabled = isChecked;
    if (parent.children?.every(ch => ch.enabled)) {
  parent.enabled = true;  // Only all children checked => parent checked
} else {
  parent.enabled = false;
}
  }
  onPermissionRowClick(perm: Permission, event: MouseEvent) {
  // Only toggle if there are children
  if (perm.children) {
    this.togglePermissionExpand(perm.id);
  }
}
getAuthItemsPayload(): string[] {
  const selected: string[] = [];

  this.permissions.forEach(parent => {
    if (parent.children && parent.children.length) {
      // If parent is checked, add parent id only
      if (parent.enabled) {
        selected.push(parent.id);
      } else {
        // Add all checked children ids
        parent.children.forEach(child => {
          if (child.enabled) {
            selected.push(child.id);
          }
        });
      }
    } else if (parent.enabled) {
      selected.push(parent.id);
    }
  });

  return selected;
}
  onSaveRole() {
  if (!this.selectedRole?.id) {
    return;
  }
  const auth_items = this.getAuthItemsPayload();
  const title = this.selectedRole.name;

  const payload = {
    auth_items,
    title
  };

  this.roleService.saveAllRoles(this.orgid, payload, this.selectedRole.id).subscribe({
    next:()=>{this.err.showToast("edited sucessfully",'success');},
    error:(err)=>{this.err.showToast(err,'error');}
  });
}
  onCreateRole() {}

  onAddNewUser() {
    this.formMode = 'add';
    this.userFormModel = {id:'',fullName: '' };
    this.isOffcanvasOpen = true;
    // this.loadroles();
  }


  onEditRole(role: Role): void {
    this.selectedRole = role;
    this.formMode = 'edit';
    this.userFormModel = { id:role.id,fullName: role.name };
    this.isOffcanvasOpen = true;
    // this.loadroles();
  }

  async onDeleteRole(role: Role) {
    if (!role.editable) return;
    // this.roles = this.roles.filter(r => r.id !== role.id);
    const confirmed = await this.err.confirmSwal('Delete User?', 'Are you sure you want to delete', role.name);
    if(confirmed)
    {
      this.roleService.deleteroleandsave(this.orgid,role.id).subscribe({
        next:()=>{this.err.showToast("Deleted sucessfully",'success');this.loadroles();},
        error:(error)=>{this.err.showToast(error,'error');}
      });
    }
  }

  get isAdminSelected(): boolean {
    return this.selectedRole?.name === 'Admin';
  }

  onEditRoleByName(roleName: string, event: Event): void {
    const role = this.roles.find(r => r.name === roleName);
    if (role) {
      this.onEditRole(role);
    }
    event.stopPropagation();
  }

  onDeleteRoleByName(roleName: string, event: Event): void {
    const role = this.roles.find(r => r.name === roleName);
    if (role) {
      this.onDeleteRole(role);
    }
    event.stopPropagation();
  }
  uncheckAllChildren(perm: Permission) {
  if (perm.children) {
    perm.children.forEach(child => child.enabled = false);
  }
  perm.enabled = false; // Also uncheck the parent, just in case
}
}