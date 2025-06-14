import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrgusersService } from '../../../../core/services/orgusers.service';
import { OrganizationService } from '../../../../core/services/organization.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UserformComponent } from '../userform/userform.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface User {
  user_id: number;
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  roleLabel: string;
  status: string;
}

interface SidebarItem {
  icon: string;
  label: string;
  active: boolean;
  route?: string;
}

type FormMode = 'add' | 'edit' | 'view';

@Component({
  selector: 'app-usermanagement',
  standalone: true,
  imports: [CommonModule, FormsModule, UserformComponent],
  templateUrl: './usermanagement.component.html',
  styleUrl: './usermanagement.component.scss'
})
export class UsermanagementComponent implements OnInit {
  searchTerm: string = '';
  entriesPerPage: number = 20;
  currentPage: number = 1;
  orgid: string = '';
  users: User[] = [];
  totalUsers: number = 0;

  isUserFormOpen = false;
  formMode: FormMode = 'add';
  selectedUser: User | null = null;

  sidebarItems: SidebarItem[] = [
    { icon: '👥', label: 'Organization', active: false, route: 'settings/organization' },
    { icon: '🛒', label: 'Configuration', active: false, route: 'settings/configuration' },
    { icon: '👤', label: 'User Management', active: true, route: 'settings/user-management' },
    { icon: '💬', label: 'Role & Permission', active: false, route: 'settings/role-permission-management' }
  ];

  constructor(
    private user: OrgusersService,
    private org: OrganizationService,
    private err: ErrorHandlerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.orgidfetch();
  }

  orgidfetch() {
    this.org.fetchorginizationid().subscribe(arg => {
      if (!arg) return;
      this.orgid = arg;
      this.loadAllUsers();
    });
  }

  loadAllUsers() {
    const params: any = {
      offset: (this.currentPage - 1) * this.entriesPerPage,
      limit: this.entriesPerPage
    };
    this.user.fetchusers(this.orgid, params).subscribe({
      next: (response) => {
        this.users = response.rows.map((item: any, i: number) => ({
          user_id: item.user_id,
          id: item.id || i + 1,
          name: item.user_details.fullname,
          email: item.user_details.email,
          mobile: item.user_details.mobile,
          role: item.role_details.id,
          roleLabel: item.role_details.title,
          status: item.user_details.status === 'ACTIVE' ? 'Active' : 'Inactive'
        }));
        this.totalUsers = response.count ?? response.rows.length;
      },
      error: (err) => { this.err.showToast(err, 'error'); }
    });
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

  onSearch(): void {
    if (this.searchTerm.trim()) {
      const params: any = {
        search: this.searchTerm.trim(),
        offset: (this.currentPage - 1) * this.entriesPerPage,
        limit: this.entriesPerPage
      };
      this.user.fetchusers(this.orgid, params).subscribe({
        next: (response) => {
          this.users = response.rows.map((item: any, i: number) => ({
            user_id: item.user_id,
            id: item.id || i + 1,
            name: item.user_details.fullname,
            email: item.user_details.email,
            mobile: item.user_details.mobile,
            role: item.role_details.id,
            roleLabel: item.role_details.title,
            status: item.user_details.status === 'ACTIVE' ? 'Active' : 'Inactive'
          }));
          this.totalUsers = response.count ?? response.rows.length;
        },
        error: (err) => { this.err.showToast(err, 'error'); }
      });
    }
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadAllUsers();
  }

  onEntriesChange(): void {
    this.currentPage = 1;
    if (this.searchTerm.trim()) {
      this.onSearch();
    } else {
      this.loadAllUsers();
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    if (this.searchTerm.trim()) {
      this.onSearch();
    } else {
      this.loadAllUsers();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.entriesPerPage);
  }

  onAddNewUser(): void {
    this.formMode = 'add';
    this.selectedUser = null;
    this.isUserFormOpen = true;
    this.loadAllUsers();
  }

  onEditUser(user: User): void {
    this.formMode = 'edit';
    this.selectedUser = user;
    this.isUserFormOpen = true;
  }

  onViewUser(user: User): void {
    this.formMode = 'view';
    this.selectedUser = user;
    this.isUserFormOpen = true;
  }

  onCopyUser(user: User): void {
    const paylod = { request_id: user.user_id.toString() };
    this.user.resendemail(paylod).subscribe({
      next:()=>{this.err.showToast('Email is sent to your account','success')},
      error:(error)=>{this.err.showToast(error,'error');}
    })
  }

  onCloseUserForm(): void {
    this.isUserFormOpen = false;
    this.selectedUser = null;
  }

  onSaveUser(userData: any): void {
    if (this.formMode === 'edit' && this.selectedUser) {
      const userIndex = this.users.findIndex(u => u.id === this.selectedUser!.id);
      if (userIndex !== -1) {
        const updatedRoleLabel = this.getRoleLabelById(userData.role);
        this.users[userIndex] = {
          ...this.users[userIndex],
          name: userData.fullName,
          email: userData.email,
          mobile: userData.mobileNumber,
          role: userData.role,
          roleLabel: updatedRoleLabel,
          status: userData.status || this.users[userIndex].status,
          user_id: this.users[userIndex].user_id
        };
        this.err.showToast('User updated successfully', 'success');
      }
    } else if (this.formMode === 'add') {
      const newRoleLabel = this.getRoleLabelById(userData.role);
      const newUser: User = {
        user_id: 0,
        id: Math.max(...this.users.map(u => u.id), 0) + 1,
        name: userData.fullName,
        email: userData.email,
        mobile: userData.mobileNumber,
        role: userData.role,
        roleLabel: newRoleLabel,
        status: 'Active'
      };
      this.users.push(newUser);
      this.err.showToast('User added successfully', 'success');
    }
    this.onCloseUserForm();
  }

  getRoleLabelById(roleId: string): string {
    return roleId;
  }

  onUserUpdated() {
    this.loadAllUsers();
  }

  onDeleteUser(user: User): void {
    Swal.fire({
      title: 'Delete User?',
      html: `Are you sure you want to delete <strong>${user.name}</strong>?<br><small class="text-muted">This action cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete user',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUserRequest(user);
      }
    });
  }

  deleteUserRequest(user: User): void {
    this.user.deleteuser(this.orgid, user.id.toString()).subscribe({
      next: () => {
        this.err.showToast('User deleted successfully', 'success');
        this.loadAllUsers(); 
      },
      error: (err) => { this.err.showToast(err, 'error'); }
    });
  }
}