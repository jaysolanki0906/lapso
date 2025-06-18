import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../../core/services/services.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { combineLatest } from 'rxjs';
import Swal from 'sweetalert2';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-serviceform',
  standalone: true,
  imports: [FormsModule, SidebarComponent, HeaderComponent, CommonModule, CKEditorModule],
  templateUrl: './serviceform.component.html',
  styleUrl: './serviceform.component.scss'
})
export class ServiceformComponent implements OnInit {
  public Editor = ClassicEditor;
  mode: 'add' | 'edit' = 'add';
  orgId: string = '';
  serviceId: string | null = null;

  serviceName: string = '';
  id: string = '';
  status: string = '';
  description: string = '';
  termsAndConditions: string = '';

  // Validation state
  serviceNameError: boolean = false;
  termsAndConditionsError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private err:ErrorHandlerService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    combineLatest([
      this.route.paramMap,
      this.organizationService.organization$
    ]).subscribe(([params, org]) => {
      this.serviceId = params.get('id');
      this.orgId = org && org.org_id ? org.org_id : '';
      this.mode = this.serviceId ? 'edit' : 'add';

      if (this.mode === 'edit' && this.orgId && this.serviceId) {
        this.servicesService.getService(this.orgId, this.serviceId).subscribe((data: any) => {
          this.id = data.id;
          this.status = data.status;
          this.serviceName = data.service_name;
          this.description = data.description;
          this.termsAndConditions = data.tnc;
        });
      } else if (this.mode === 'add') {
        // Reset fields for add mode
        this.serviceName = '';
        this.description = '';
        this.termsAndConditions = '';
      }
      // Reset validation errors
      this.serviceNameError = false;
      this.termsAndConditionsError = false;
    });
  }

  validate(): boolean {
    this.serviceNameError = !this.serviceName.trim();
    // Check for empty or just HTML tags in CKEditor
    const plainTextTerms = this.termsAndConditions?.replace(/<(.|\n)*?>/g, '').trim();
    this.termsAndConditionsError = !plainTextTerms;
    return !(this.serviceNameError || this.termsAndConditionsError);
  }

  onSave() {
    if (!this.validate()) {
      // Optionally, add a toast/message here
      return;
    }

    const serviceData = {
      id: this.id,
      status: this.status,
      service_name: this.serviceName,
      description: this.description,
      tnc: this.termsAndConditions
    };

    if (this.mode === 'add') {
      this.servicesService.addservice(this.orgId, serviceData).subscribe({
        next: () => {
          this.router.navigate(['/service']);
          this.err.showToast('Sucessfully update','success');
        },
        error: err => {
          this.err.showToast(err,'error');
        }
      });
    } else if (this.mode === 'edit' && this.serviceId) {
      this.servicesService.updateservice(this.orgId, this.serviceId, serviceData).subscribe({
        next: () => {
          this.router.navigate(['/service']);
          this.err.showToast('Sucessfully edited','success');
        },
        error: err => {
          this.err.showToast(err,'warning');
        }
      });
    }
  }

  onView(row: any) {
    Swal.fire({
      title: 'Services',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 16px;">
            <strong>Service Name</strong>
            <span style="margin-left: 30px; color: #666;">${row.service_name || ''}</span>
          </div>
          <div style="margin-bottom: 16px;">
            <strong>Contract Description</strong>
            <span style="margin-left: 10px; color: #666;">${row.description || ''}</span>
          </div>
          <div style="margin-bottom: 16px;">
            <strong>Terms & Condition</strong>
            <div style="width:100%;margin-top:5px;height:70px;resize:none;border:1px solid #ccc;padding:6px;overflow:auto;background:#fafbfc;" readonly>${row.terms_and_conditions || ''}</div>
          </div>
          <div style="margin-top: 32px;">
            <strong>Status</strong>
            <span style="margin-left: 60px; color: #228B22;">${row.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: 600,
      customClass: {
        popup: 'swal2-service-view-popup'
      }
    });
  }

  onBack() {
    this.router.navigate(['/service']);
  }
}