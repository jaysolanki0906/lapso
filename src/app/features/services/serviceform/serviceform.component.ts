import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ServicesService } from '../../../core/services/services.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { combineLatest } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-serviceform',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './serviceform.component.html',
  styleUrl: './serviceform.component.scss'
})
export class ServiceformComponent implements OnInit {
  mode: 'add' | 'edit' = 'add';
  orgId: string = '';
  serviceId: string | null = null;

  serviceName: string = '';
  description: string = '';
  termsAndConditions: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
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
      console.log('ServiceformComponent ngOnInit');
      console.log('serviceId:', this.serviceId);
      console.log('orgId:', this.orgId);
      console.log('mode:', this.mode);

      if (this.mode === 'edit' && this.orgId && this.serviceId) {
        this.servicesService.getService(this.orgId, this.serviceId).subscribe((data: any) => {
          this.serviceName = data.service_name;
          this.description = data.description;
          this.termsAndConditions = data.tnc;
          console.log('Loaded service:', data);
        });
      } else if (this.mode === 'add') {
        // Reset fields for add mode
        this.serviceName = '';
        this.description = '';
        this.termsAndConditions = '';
        console.log('Reset fields for add mode');
      }
    });
  }

  onSave() {
    const serviceData = {
      service_name: this.serviceName,
      description: this.description,
      terms_and_conditions: this.termsAndConditions
    };

    console.log('onSave called');
    console.log('mode:', this.mode);
    console.log('orgId:', this.orgId);
    console.log('serviceId:', this.serviceId);
    console.log('serviceData:', serviceData);

    if (this.mode === 'add') {
      this.servicesService.addservice(this.orgId, serviceData).subscribe({
        next: () => {
          console.log('Service added successfully');
          this.router.navigate(['/service']);
        },
        error: err => {
          console.error('Error adding service:', err);
        }
      });
    } else if (this.mode === 'edit' && this.serviceId) {
      this.servicesService.updateservice(this.orgId, this.serviceId, serviceData).subscribe({
        next: () => {
          console.log('Service updated successfully');
          this.router.navigate(['/service']);
        },
        error: err => {
          console.error('Error updating service:', err);
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
          <textarea 
            class="form-textarea" 
            style="width:100%;margin-top:5px;height:70px;resize:none;" 
            placeholder="Insert text here ..." 
            readonly>${row.terms_and_conditions || ''}</textarea>
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
    console.log('Back button clicked');
    this.router.navigate(['/service']);
  }
}