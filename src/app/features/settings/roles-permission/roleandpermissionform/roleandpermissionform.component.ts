import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Organization, OrganizationService } from '../../../../core/services/organization.service';
import { RolePermissionService } from '../../../../core/services/role-permission.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-roleandpermissionform',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roleandpermissionform.component.html',
  styleUrl: './roleandpermissionform.component.scss'
})
export class RoleandpermissionformComponent implements OnInit{
  @Input() isOpen: boolean = false;
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() userForm = {id:'', fullName: '' };
  orgid:string='';

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  constructor(private org:OrganizationService,
    private role:RolePermissionService,private err:ErrorHandlerService){}
  ngOnInit(): void {
      this.callorg();
  }
  callorg(){
    this.org.fetchorginizationid().subscribe(args=>{
      if(!args) return;
      this.orgid = args;
    });
  }

  onSave(formRef: any) {
    if (formRef.valid) {
      this.save.emit(this.userForm);
    }
    const paylod={title:formRef.value.fullName}
    if(this.mode=='add')
    {
      this.role.saverole(this.orgid,paylod).subscribe({
        next:()=>{this.err.showToast('Data is sucessfully saved','success');this.save.emit(this.userForm);},
        error:(error)=>{this.err.showToast(error,'error')}
      })
    }
    else if(this.mode=='edit')
    {
      this.role.editroles(this.orgid,paylod,this.userForm.id).subscribe({
        next:()=>{
          this.err.showToast('Your record is updated sucessfully','success');
          this.save.emit(this.userForm);
        },
        error:(err)=>{this.err.showToast(err,'error')}
      })
    }
  }

  onClose() {
    this.close.emit();
  }
}