import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { OrganizationService } from '../../../../core/services/organization.service';
import { OrgusersService } from '../../../../core/services/orgusers.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

interface RoleOption {
  value: string;
  label: string;
};

@Component({
  selector: 'app-userform',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './userform.component.html',
  styleUrl: './userform.component.scss'
})
export class UserformComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Output() userUpdated = new EventEmitter<void>();
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() userData: any = null;
  orgid: string = '';
  userid:string='';
  @Output() closeForm = new EventEmitter<void>();
  @Output() saveUser = new EventEmitter<any>();
  roles: RoleOption[] = [];
  
  userForm = {
    fullName: '',
    email: '',
    mobileNumber: '',
    role: '',
    status: 'Active'
  };

  constructor(
    private organisation: OrganizationService,
    private role: OrgusersService,
    private err: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.fetchorgid();
  }

  fetchorgid() {
    this.organisation.fetchorginizationid().subscribe(id => {
      if (!id) return;
      this.orgid = id;
      this.fetchroles(id);
    });
  }

  fetchroles(id: any) {
    this.role.fetchroles(id).subscribe({
      next: (value) => {
        this.roles = value.map((item: any) => ({
          value: item.id,
          label: item.title
        }));
      },
      error: (err) => {
        this.err.showToast(err, 'error');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.mode !== 'add' && this.userData) {
      this.userid=this.userData.id;
      this.userForm = {
        fullName: this.userData.name || '',
        email: this.userData.email || '',
        mobileNumber: this.userData.mobile || '',
        role: this.userData.role || '',
        status: this.userData.status || 'Active'
      };
    } else if (this.mode === 'add') {
      this.resetForm();
    }
  }

  onClose() {
    this.closeForm.emit();
  }

  onSave(form: NgForm) {
    if (form.valid) {
      const paylod = {
        email: this.userForm.email,
        fullname: this.userForm.fullName,
        mobile: this.userForm.mobileNumber,
        role_id: this.userForm.role,
        status: this.userForm.status.toUpperCase()
      };
      if(this.mode === 'add') {
        this.role.saveuser(this.orgid, paylod).subscribe({
          next: (res) => {
            this.err.showToast("Congartulations your record is saved", 'success');
            this.userUpdated.emit();
            this.onClose();
          },
          error: (erro) => { this.err.showToast(erro, 'error'); }
        });
      } else if(this.mode === 'edit') {
        
        this.role.edituser(this.orgid,this.userid, paylod).subscribe({
          next: (res) => {
            this.err.showToast("Congartulations your record is Updated", 'success');
            this.userUpdated.emit();
            this.onClose();
          },
          error: (erro) => { this.err.showToast(erro, 'error'); }
        });
      }
    }
  }

  resetForm() {
    this.userForm = {
      fullName: '',
      email: '',
      mobileNumber: '',
      role: '',
      status: 'Active'
    };
  }
  getRoleLabel(roleId: string): string {
    const found = this.roles.find(r => r.value === roleId);
    return found ? found.label : roleId;
  }
}