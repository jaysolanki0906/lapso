import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicecallService } from '../../../core/services/servicecall.service';
import { OrganizationService } from '../../../core/services/organization.service';

@Component({
  selector: 'app-servicecallform',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicecallform.component.html',
  styleUrl: './servicecallform.component.scss'
})
export class ServicecallformComponent implements OnInit, OnChanges {
  @Input() orgId: string = '';
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() data: any = null;
  @Output() updateNeeded = new EventEmitter<void>();
  selectedVoucherId: string = '';

  serviceCall: any = {
    service_date: '', // Set in constructor or onInit
    service_name: '',
    customer_name: '',
    customer_number: '',
    service_type: null,
    purpose: '',
    address: '',
    status: 'PENDING',
    assigned_to: '',
  };
  submitting = false;

  searchValue = '';
  searchResults: any[] = [];
  searching = false;
  orgid: string = '';
  showDropdown = false;
  private searchTimeout: any = null;

  assignedToList: any[] = [];
  loadingAssignees = false;

  constructor(
    private servicecallService: ServicecallService,
    private org: OrganizationService
  ) {}

  ngOnInit() {
    // Set today's date for add mode
    if (!this.data || this.mode === 'add') {
      this.serviceCall.service_date = this.getTodayDateString();
    }
    if (this.data) this.patchFormWithData(this.data);

    this.organisation();
  }

  organisation() {
    this.org.fetchorginizationid().subscribe(id => {
      this.orgId = id;
      if (this.orgId) {
        this.loadAssignees();
      }
    });
  }

  getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) this.patchFormWithData(this.data);
    if (changes['mode'] && this.mode === 'add') {
      this.resetForm();
    }
  }

  patchFormWithData(data: any) {
    this.serviceCall = {
      service_date: data.service_date || this.getTodayDateString(),
      service_name: data.service_name || '',
      customer_name: data.customer_name || '',
      customer_number: data.customer_number || '',
      service_type: data.service_type || null,
      purpose: data.purpose || '',
      address: data.address || '',
      status: data.status || 'PENDING',
      assigned_to: data.user_id || data.assigned_to || '',
      id: data.id || null
    };
    // If your data model has the voucher id in a different field, set it here:
    this.selectedVoucherId =
      data.service_voucher_id_form ||
      data.service_voucher_id ||
      data.voucher_id ||
      ''; // adjust field as per your API
    this.searchValue = data.customer_name || '';
  }

  resetForm() {
    this.serviceCall = {
      service_date: this.getTodayDateString(),
      service_name: '',
      customer_name: '',
      customer_number: '',
      service_type: null,
      purpose: '',
      address: '',
      status: 'PENDING',
      assigned_to: '',
    };
    this.searchValue = '';
    this.searchResults = [];
    this.showDropdown = false;
    this.selectedVoucherId = '';
  }

  onSearchInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (value && value.length >= 3) {
      this.searching = true;
      this.showDropdown = true;
      this.searchTimeout = setTimeout(() => {
        this.servicecallService.getservicevoucher(this.orgId, { search: value }).subscribe((res: any) => {
          this.searchResults = Array.isArray(res.data) ? res.data : [];
          this.searching = false;
          this.showDropdown = true;
        }, (error: any) => {
          this.searching = false;
          this.showDropdown = true;
          this.searchResults = [];
        });
      }, 0);
    } else {
      this.showDropdown = false;
      this.searchResults = [];
    }
  }

  onSelectVoucher(option: any) {
    this.selectedVoucherId = option.id;
    this.serviceCall.service_name = option.service_name || '';
    this.serviceCall.customer_name = option.cust_name || '';
    this.serviceCall.customer_number = option.cust_mobile || option.contact_number || '';
    this.serviceCall.address = option.address || '';
    this.serviceCall.status = option.status || 'PENDING';
    this.searchValue = option.cust_name + ' (' + (option.cust_mobile || option.contact_number) + ')';
    this.showDropdown = false;
  }

  loadAssignees() {
    this.loadingAssignees = true;
    this.assignedToList = [];
    this.servicecallService.getusers(this.orgId).subscribe(
      (res: any) => {
        this.assignedToList = Array.isArray(res) ? res : [];
        this.loadingAssignees = false;
      },
      (err: any) => {
        this.loadingAssignees = false;
        this.assignedToList = [];
      }
    );
  }

  onSubmit(form: any) {
    if (form.invalid || this.mode === 'view') return;
    this.submitting = true;

    const payload = {
      completion_date: this.serviceCall.service_date,
      description: null,
      purpose: this.serviceCall.purpose || null,
      service_date: this.serviceCall.service_date,
      service_type: this.serviceCall.service_type,
      service_voucher_id_form: this.selectedVoucherId,
      user_id: this.serviceCall.assigned_to || null
    };

    const orgid = this.orgId;
    const vid = this.selectedVoucherId;

    if (!vid) {
      alert('Please select a service voucher.');
      this.submitting = false;
      return;
    }

    if (this.mode === 'add') {
      this.servicecallService.schedulecall(orgid, vid, payload).subscribe(
        (res) => {
          this.submitting = false;
          this.updateNeeded.emit();
        },
        (err) => {
          this.submitting = false;
          alert('Error adding call');
        }
      );
    } else if (this.mode === 'edit') {
      this.submitting = false;
      const id = this.serviceCall.id;
      this.servicecallService.editcall(orgid, vid, payload,id).subscribe(
        (res) => {
          this.submitting = false;
          this.updateNeeded.emit();
        },
        (err) => {
          this.submitting = false;
          alert('Error adding call');
        }
      );
    }
  }
  
}