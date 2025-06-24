import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicevoucherService } from '../../../core/services/servicevoucher.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ServicecallService } from '../../../core/services/servicecall.service';
import { CommonTableCardComponent, SearchField, TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import { RolePermissionService } from '../../../core/services/role-permission.service';
import Swal from 'sweetalert2';
import { ServicecallformComponent } from '../../servicecall/servicecallform/servicecallform.component';

@Component({
  selector: 'app-servicevoucherform',
  standalone: true,
  imports: [CommonModule,FormsModule,CommonTableCardComponent,ServicecallformComponent, HeaderComponent, SidebarComponent, CKEditorModule],
  templateUrl: './servicevoucherform.component.html',
  styleUrl: './servicevoucherform.component.scss',
})
export class ServicevoucherformComponent implements OnInit {
  voucherDate: string = '';
  voucherNumber: string = '';
  customerName: string = '';
  customerMobile: string = '';
  alternateContact: string = '';
  address: string = '';
  action:boolean=false;
  selectedServiceCall: any = null;
  serviceName: string = '';
  contractStartDate: string = '';
  contractDuration: string = '';
  contractExpired: string = '';
  termsConditions: string = '';
  contractDescription: string = '';
  contractAmount: string = '';
  serviceCallDetails: any;
  loadingDetails: boolean = false;
  errorLoadingDetails: boolean = false;
  orgid: string = '';
  canEdit = false;
  submitted = false;
  canDelete = false;
  canView = false;
  canCreate = false;
  id='';
  serviceOptions: Array<{ id: string; service_name: string }> = [];
  productOptions: Array<any> = [];
  contactOptions: Array<{ id: string; name: string; mobile: string; org_name: string }> = [];
  showContactDropdown: boolean = false;
  customerNameInput$ = new Subject<string>();
  customerSearchLoading: boolean = false;
  selectedVoucherId: string = '';
  submitting = false;
  serviceCall: any = {};
  addProducts: boolean = false;
  formMode: 'add' | 'edit' | 'view'|'action' = 'add';
  formHeading = 'Add Service Call';
  filtereddata:any=[];
  addScheduleService: boolean = false;
  mode: 'view' | 'edit' | 'add' = 'view';
  products: Array<any> = [];
  serviceCalls: Array<{ serviceDate: string; serviceType: string; purpose: string; description?: string; user_id?: string; status?: string }> = [];
  serviceVoucherId: string = '';
  public Editor = ClassicEditor;
  public editorInstance: any;
  public editorConfig: any = {
    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
  };

  errors: { [key: string]: string } = {};
  productErrors: string[] = [];
  serviceCallErrors: string[] = [];
  fieldTouched: { [key: string]: boolean } = {};

  columns: TableColumn[] = [
    { key: 'service_date', label: 'Service Date', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'customer_number', label: 'Customer Number' },
    { key: 'complaints_source', label: 'Raised By' },
    { key: 'user_details.fullname', label: 'Assigned To' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'status', label: 'Status' },
  ];

  searchFields: SearchField[] = [
    { title: 'Status', type: 'dropdown', key: 'status', multiple: false, options: [
      { value: '', label: 'All' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'COMPLETED', label: 'Completed' }
    ], placeholder: 'Select Status' },
    { title: 'Service type', type: 'dropdown',multiple: false, key: 'servicetype', options: [
      { value: '', label: 'All' },
      { value: 'SCHEDULED', label: 'Scheduled' },
      { value: 'COMPLAINTS', label: 'Complaints' }
    ], placeholder: 'Select Service Type' },
    { title: 'Assigned', type: 'dropdown', key: 'assigned', multiple: true,options: [], placeholder: 'Select Assigned' },
  ];

  Status: string = '';
  Service_type: string = '';
  Assigned: string[] = [];
  searchQuery: string = '';
  page: number = 1;

  constructor(
    private servicecall:ServicecallService,
    private servicesService: ServicevoucherService,
    private organizationService: OrganizationService,
    private router: Router,
    private role:RolePermissionService,
    private route: ActivatedRoute,
    private err: ErrorHandlerService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (this.router.url.includes('/edit/')) {
        this.mode = 'edit';
        this.serviceVoucherId = params.get('id') || '';
      } else if (this.router.url.includes('/add')) {
        this.mode = 'add';
        this.serviceVoucherId = '';
      } else if (this.router.url.includes('/view/')) {
        this.mode = 'view';
        this.serviceVoucherId = params.get('id') || '';
      }
      this.organisation();
      if(this.mode==='view')
      {
        this.fetchServiceCallDetails(this.orgid, this.serviceVoucherId);
        this.values(this.orgid);
      }
    });

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    this.voucherDate = todayStr;
    this.contractStartDate = todayStr;
    this.canCreate = this.role.getPermission('service_call', 'service_call_create');
    this.canView = this.role.getPermission('service_call', 'service_call_view');
    this.canEdit = this.role.getPermission('service_call', 'service_call_edit');
    this.canDelete = this.role.getPermission('service_call', 'service_call_delete');
  }

  isInvalidMobile(num: string): boolean {
    return !!num && !/^\d{10}$/.test(num);
  }
  isInvalidPositiveNumber(val: any): boolean {
    const n = Number(val);
    return val !== '' && (isNaN(n) || n <= 0);
  }
  isInvalidNonNegativeNumber(val: any): boolean {
    const n = Number(val);
    return val !== '' && (isNaN(n) || n < 0);
  }

  markFieldTouched(field: string) {
    this.fieldTouched[field] = true;
  }

  markAllFieldsTouched() {
    [
      'contractAmount',
      'voucherDate',
      'voucherNumber',
      'customerName',
      'customerMobile',
      'alternateContact',
      'address',
      'serviceName',
      'contractStartDate',
      'contractDuration',
      'termsConditions',
      'contractAmount'
    ].forEach(field => this.fieldTouched[field] = true);

    if (this.addProducts) {
      for (let i = 0; i < this.products.length; i++) {
        this.fieldTouched[`product_product_${i}`] = true;
        this.fieldTouched[`product_quantity_${i}`] = true;
      }
    }

    if (this.addScheduleService) {
      for (let i = 0; i < this.serviceCalls.length; i++) {
        this.fieldTouched[`serviceCallDate${i}`] = true;
        this.fieldTouched[`serviceCallPurpose${i}`] = true;
      }
    }
  }

  onEditorReady(editor: any) {
    this.editorInstance = editor;

    if (this.isViewMode) {
      editor.enableReadOnlyMode('readonly-mode');
      if (editor.ui?.view?.toolbar?.element) {
        editor.ui.view.toolbar.element.style.display = 'none';
      }
    } else {
      editor.disableReadOnlyMode('readonly-mode');
      if (editor.ui?.view?.toolbar?.element) {
        editor.ui.view.toolbar.element.style.display = 'flex';
      }
    }
  }
   onAdd() {
    this.formHeading = 'Add Service Call';
    this.formMode = 'add';
    this.selectedServiceCall = null;
    this.action = false;
    this.id = this.serviceVoucherId;
    this.openOffcanvas();
 }
   openOffcanvas() {
    setTimeout(() => {
      (window as any).bootstrap
        ?.Offcanvas.getOrCreateInstance(
          document.getElementById('serviceCallOffcanvas')
        )
        .show();
    }, 0);
  }
   onCall(row: any) {
    this.formMode = 'action';
    this.formHeading = 'Take Action on Service Call';
    this.action = true;
    this.selectedServiceCall = {
      ...row,
      service_voucher_id: row.service_voucher_id || (row.service_vouchers && row.service_vouchers.id),
      id: row.id,
      org_id: row.org_id || this.orgid
    };
    const offcanvasElement = document.getElementById('serviceCallOffcanvas');
    if (offcanvasElement && (window as any).bootstrap?.Offcanvas) {
      const bsOffcanvas = new (window as any).bootstrap.Offcanvas(offcanvasElement);
      bsOffcanvas.show();
    } else {
      console.error('Offcanvas element or Bootstrap Offcanvas not available');
    }
  }
   async onDelete(row?: any) {
      const orgid = this.orgid;
      if (row) {
        const voucherId = row.service_voucher_id || (row.service_vouchers && row.service_vouchers.id);
        this.selectedVoucherId = voucherId;
        this.serviceCall = { ...row };
      }
      const vid = this.selectedVoucherId;
      const id = this.serviceCall.id;
      const isConfirmed = await this.err.confirmSwal('Delete', 'Are you sure you want to delete', `${row.customer_name}`);
  
      if (isConfirmed) {
        if (!orgid || !vid || !id) {
          Swal.fire('Error', 'Required identifiers are missing.', 'error');
          return;
        }
        this.submitting = true;
        this.servicecall.deletecall(orgid, vid, id).subscribe(
          res => {
            this.submitting = false;
            this.err.showToast('Service call has been deleted.','success');
            this.fetchServiceCallDetails(orgid,vid);
          },
          err => {
            this.submitting = false;
            this.err.showToast(err, 'error');
          }
        );
      }
    }
    onFormUpdate() {
    this.closeOffcanvas();
    this.fetchServiceCallDetails(this.orgid,this.serviceVoucherId);
  }
  closeOffcanvas() {
    (window as any).bootstrap
      ?.Offcanvas.getOrCreateInstance(
        document.getElementById('serviceCallOffcanvas')
      )
      .hide();
      this.action = false;
  }
  onEdit(row: any) {
    this.formMode = 'edit';
    this.action = false;
    this.formHeading = 'Edit Service Call';
    this.selectedServiceCall = row;
    this.openOffcanvas();
  }
  values(orgid: string) {
    this.servicecall.getusers(orgid).subscribe({
      next: (res) => {
        const users = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const options = [
          ...users.map((user: any) => ({
            value: user.id,
            label: user.fullname
          }))
        ];
        this.searchFields = this.searchFields.map(field =>
          field.key === 'assigned' ? { ...field, options } : field
        );
      },
      error: (err) => {
        console.error('Failed to fetch users for Assigned dropdown', err);
      }
    });
  }
  onClear() {
    this.searchQuery = '';
    this.Status = '';
    this.Assigned= [];
    this.page = 1;
    this.fetchServiceCallDetails(this.orgid,this.serviceVoucherId);
  }
   onView(row: any) {
      const orgId = row.org_id || this.orgid;
      const voucherId = row.service_voucher_id || (row.service_vouchers && row.service_vouchers.id);
      const callId = row.id;
      if (!orgId || !voucherId || !callId) {
        Swal.fire('Error', 'Missing identifiers for service call.', 'error');
        return;
      }
  
      Swal.fire({
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
  
      this.servicecall.fetchcall(orgId, voucherId, callId).subscribe(
        (call: any) => {
          Swal.close();
          const voucher = call.service_vouchers || {};
          this.selectedVoucherId = voucher.id;
          this.serviceCall = { ...call };
  
          // Render services action table rows:
          let servicesTableRows = '';
          // Use service_call_actions for actions, not services
          if (Array.isArray(call.service_call_actions) && call.service_call_actions.length > 0) {
            servicesTableRows = call.service_call_actions.map((action: any) => `
              <tr>
                <td style="padding: 4px 8px;">${action.action_date || ''}</td>
                <td style="padding: 4px 8px;">${action.observation || ''}</td>
                <td style="padding: 4px 8px;">${action.action_note || ''}</td>
                <td style="padding: 4px 8px;">
                  ${action.attachment_details && action.attachment_details.file_url
                    ? `<a href="${action.attachment_details.file_url}" target="_blank">View</a>`
                    : ''}
                </td>
                <td style="padding: 4px 8px;">${action.status || ''}</td>
              </tr>
            `).join('');
          } else {
            servicesTableRows = `<tr><td colspan="5" style="text-align:center;color:#7b7b7b;padding:16px 0;">No Actions found</td></tr>`;
          }
  
          Swal.fire({
            title: '<span style="font-size:1.3rem;font-weight:600;">Service calls</span>',
            html: `
              <div style="margin: 10px 0 0 0;">
                <div style="display: flex; justify-content: space-between;">
                  <div style="width: 48%;">
                    <div style="margin-bottom:8px;"><b>Voucher Date</b> <span style="float:right;color:#7b7b7b;">${voucher.voucher_date || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Voucher Number</b> <span style="float:right;color:#7b7b7b;">${voucher.voucher_number || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Customer Name</b> <span style="float:right;color:#7b7b7b;">${voucher.cust_name || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Customer Mobile Number</b> <span style="float:right;color:#7b7b7b;">${voucher.cust_mobile || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Service Name</b> <span style="float:right;color:#7b7b7b;">${voucher.org_service_plan?.service_name || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Contract Start Date</b> <span style="float:right;color:#7b7b7b;">${voucher.contract_start_date || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Contract Expiry</b> <span style="float:right;color:#7b7b7b;">${voucher.contract_end_date || ''}</span></div>
                  </div>
                  <div style="width: 48%;">
                    <div style="margin-bottom:8px;"><b>Service Date</b> <span style="float:right;color:#7b7b7b;">${call.service_date || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Service Type</b> <span style="float:right;color:#7b7b7b;">${call.service_type === 'SCHEDULED' ? 'Scheduled' : (call.service_type || '')}</span></div>
                    <div style="margin-bottom:8px;"><b>Purpose</b> <span style="float:right;color:#7b7b7b;">${call.purpose || ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Completed Date</b> <span style="float:right;color:#7b7b7b;">${call.completion_date ? (call.completion_date.split('T')[0]) : ''}</span></div>
                    <div style="margin-bottom:8px;"><b>Status</b> <span style="float:right;color:#7b7b7b;">${call.status === 'PENDING' ? 'Pending' : (call.status || '')}</span></div>
                  </div>
                </div>
                <hr style="margin:16px -16px 8px -16px;">
                <div>
                  <table style="width:100%;border-collapse:collapse;">
                    <thead>
                      <tr style="text-align:left;">
                        <th style="padding: 4px 8px;">Action Date</th>
                        <th style="padding: 4px 8px;">Observation</th>
                        <th style="padding: 4px 8px;">Action Taken</th>
                        <th style="padding: 4px 8px;">Attachment</th>
                        <th style="padding: 4px 8px;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${servicesTableRows}
                    </tbody>
                  </table>
                </div>
                <hr style="margin:8px -16px 0 -16px;">
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
                  <button id="voucherDetailBtn" style="background:#ff4250;color:white;padding:8px 20px;border-radius:5px;border:none;font-weight:600;cursor:pointer;">
                    View Voucher Details
                  </button>
                </div>
              </div>
            `,
            showConfirmButton: false,
            width: 700,
            didOpen: () => {
              document.getElementById('voucherDetailBtn')?.addEventListener('click', () => {
                if (voucher.id) {
                  window.location.href = `/servicevoucher/view/${voucher.id}`;
                }
              });
            }
          });
        },
        (error:any) => {
          Swal.fire('Error', 'Could not load service call details.', 'error');
        }
      );
    }

  onSearch(searchObj: any) {
    let ctn=0;
    this.Status = searchObj['status'];
    this.Service_type = searchObj['servicetype'];
    this.Assigned = searchObj['assigned'];
    this.searchQuery = searchObj.search || '';
    this.page = 1;
    ctn++;
    this.fetchServiceCallDetails(this.orgid,this.serviceVoucherId);
  }

  fetchServiceCallDetails(orgid: string, serviceVoucherId: string) {
    this.loadingDetails = true;
    this.errorLoadingDetails = false;

    this.servicecall.getcall(orgid, serviceVoucherId, {
      search: this.searchQuery,
      status: this.Status,
      servicetype: this.Service_type,
      assigned: this.Assigned
    }).subscribe({
      next: (res) => {
        this.serviceCallDetails = res;
        this.loadingDetails = false;
      },
      error: (error) => {
        this.errorLoadingDetails = true;
        this.loadingDetails = false;
      }
    });
  }

  organisation() {
    this.organizationService.fetchorginizationid().subscribe((orgid) => {
      this.orgid = orgid;
      this.onvouchernumber();
      this.setupCustomerAutocomplete();
      if (this.orgid) {
        this.fetchServiceOptions(orgid);
        this.fetchProductOptions();
        if (this.serviceVoucherId && (this.mode === 'edit' || this.mode === 'view')) {
          this.loadServiceVoucherForEdit();
        }
      }
    });
  }

  updateContractEndDate() {
    if (this.contractStartDate && this.contractDuration) {
      const startDate = new Date(this.contractStartDate);
      const months = parseInt(this.contractDuration, 10);

      if (!isNaN(months) && months > 0) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + months);
        this.contractExpired = endDate.toISOString().slice(0, 10);
      } else {
        this.contractExpired = '';
      }
    } else {
      this.contractExpired = '';
    }
  }

  loadServiceVoucherForEdit() {
    this.errors = {};
    this.productErrors = [];
    this.serviceCallErrors = [];
    this.validate();

    this.servicesService.editservice(this.orgid, this.serviceVoucherId).subscribe((res: any) => {
      this.voucherDate = res.voucher_date || '';
      this.voucherNumber = res.voucher_number || '';
      this.customerName = res.cust_name || '';
      this.customerMobile = res.cust_mobile || '';
      this.alternateContact = res.contact_number || '';
      this.address = res.address || '';
      this.serviceName = res.service_id || '';
      this.contractStartDate = res.contract_start_date || '';
      this.contractDuration = res.contract_duration?.toString() || '';
      this.contractExpired = res.contract_end_date || '';
      this.contractAmount = res.amount !== undefined && res.amount !== null ? res.amount.toString() : '';
      this.termsConditions = res.tnc || '';
      this.contractDescription = res.description || '';
      this.addProducts = !!(res.items && res.items.length);
      this.products = (res.items || []).map((item: any) => ({
        product: item.item_id || item.id || '',
        description: item.description || '',
        quantity: item.quantity || 1,
      }));
      if (res.service_calls) {
        this.addScheduleService = !!res.service_calls.length;
        this.serviceCalls = res.service_calls.map((call: any) => ({
          serviceDate: call.service_date ? call.service_date.slice(0, 10) : '',
          serviceType: call.service_type,
          purpose: call.purpose,
          description: call.description,
          status: call.status,
          user_id: call.user_id,
        }));
      } else {
        this.addScheduleService = false;
        this.serviceCalls = [];
      }
    });
  }

  setupCustomerAutocomplete() {
    this.customerNameInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((val) => !!val && val.trim().length > 0),
        switchMap((val) => {
          this.customerSearchLoading = true;
          return this.servicesService.customername(this.orgid, val);
        })
      )
      .subscribe({
        next: (res: any) => {
          this.contactOptions = res?.data ?? [];
          this.showContactDropdown = this.contactOptions.length > 0;
          this.customerSearchLoading = false;
        },
        error: () => {
          this.contactOptions = [];
          this.showContactDropdown = false;
          this.customerSearchLoading = false;
        },
      });
  }

  fetchServiceOptions(orgid: string) {
    this.servicesService.fetchservice(orgid).subscribe((res: any) => {
      this.serviceOptions = res.data ?? [];
    });
  }

  fetchProductOptions() {
    if (!this.orgid) return;
    this.servicesService.fetchproduct(this.orgid).subscribe((res: any) => {
      this.productOptions = res;
    });
  }

  onProductChange(productObj: any, index: number) {
    const selected = this.productOptions.find((p) => p.id === productObj.product);
    if (selected) {
      productObj.description = selected.description || '';
    } else {
      productObj.description = '';
    }
  }

  onvouchernumber() {
    if (!this.orgid) return;
    this.servicesService.getvouchernumber(this.orgid).subscribe((res: any) => {
      this.voucherNumber = res && res.voucher_number ? res.voucher_number : '';
    });
  }

  onCustomerNameInput(event: any) {
    const val = event.target.value;
    this.customerName = val;
    if (!val || val.trim().length === 0) {
      this.showContactDropdown = false;
      this.contactOptions = [];
      return;
    }
    this.customerNameInput$.next(val);
  }

  setCustomerFromDropdown(option: any) {
    this.customerName = option.name;
    this.customerMobile = option.mobile;
    this.showContactDropdown = false;
    this.customerNameInput$.next('');
  }

  onBlurDropdown() {
    setTimeout(() => {
      this.showContactDropdown = false;
    }, 300);
  }

  onFocusInput() {
    if (this.contactOptions.length > 0 && this.customerName.trim().length > 0) {
      this.showContactDropdown = true;
    }
  }

  onBack() {
    this.router.navigate(['/vouchers']);
  }

  validate() {
    this.errors = {};
    this.productErrors = [];
    this.serviceCallErrors = [];
    let valid = true;

    if (!this.voucherDate) {
      this.errors['voucherDate'] = 'Voucher Date is required';
      valid = false;
    }
    if (!this.voucherNumber) {
      this.errors['voucherNumber'] = 'Voucher Number is required';
      valid = false;
    }
    if (!this.customerName) {
      this.errors['customerName'] = 'Customer Name is required';
      valid = false;
    }
    if (!this.customerMobile) {
      this.errors['customerMobile'] = 'Customer Mobile Number is required';
      valid = false;
    } else if (this.isInvalidMobile(this.customerMobile)) {
      this.errors['customerMobile'] = 'Enter a valid 10-digit mobile number';
      valid = false;
    }
    if (!this.alternateContact) {
      this.errors['alternateContact'] = 'Alternate Contact Number is required';
      valid = false;
    } else if (this.isInvalidMobile(this.alternateContact)) {
      this.errors['alternateContact'] = 'Enter a valid 10-digit number';
      valid = false;
    }
    if (!this.address) {
      this.errors['address'] = 'Address is required';
      valid = false;
    }
    if (!this.serviceName) {
      this.errors['serviceName'] = 'Service Name is required';
      valid = false;
    }
    if (!this.contractStartDate) {
      this.errors['contractStartDate'] = 'Contract Start Date is required';
      valid = false;
    }
    if (!this.contractDuration) {
      this.errors['contractDuration'] = 'Contract Duration is required';
      valid = false;
    } else if (this.isInvalidPositiveNumber(this.contractDuration)) {
      this.errors['contractDuration'] = 'Contract Duration must be a positive number';
      valid = false;
    }
    if (!this.termsConditions || !this.termsConditions.trim() || this.termsConditions === '<br>') {
      this.errors['termsConditions'] = 'Terms & Conditions are required';
      valid = false;
    }
    if (!this.contractAmount) {
      this.errors['contractAmount'] = 'Contract Amount is required';
      valid = false;
    } else if (this.isInvalidNonNegativeNumber(this.contractAmount)) {
      this.errors['contractAmount'] = 'Contract Amount must be a valid number';
      valid = false;
    }

    if (this.addProducts) {
      if (!this.products.length) {
        this.productErrors.push('At least one product is required');
        valid = false;
      }
      this.products.forEach((p, idx) => {
        let perr = '';
        if (!p.product) perr += 'Select a product. ';
        if (!p.quantity || isNaN(Number(p.quantity)) || Number(p.quantity) < 1) perr += 'Quantity should be >= 1. ';
        if (perr) {
          this.productErrors[idx] = perr.trim();
          valid = false;
        }
      });
    }

    if (this.addScheduleService) {
      if (!this.serviceCalls.length) {
        this.serviceCallErrors.push('At least one service call is required');
        valid = false;
      }
      this.serviceCalls.forEach((c, idx) => {
        let cerr = '';
        if (!c.serviceDate) cerr += 'Service Date required. ';
        if (cerr) {
          this.serviceCallErrors[idx] = cerr.trim();
          valid = false;
        }
      });
    }

    return valid;
  }

  onSaveServiceVoucher() {
    this.submitted = true;
    this.markAllFieldsTouched();
    if (!this.validate()) {
      return;
    }

    let contractEndDate = '';
    const contractDurationNum = this.contractDuration ? parseInt(this.contractDuration, 10) : 0;
    if (this.contractStartDate && contractDurationNum) {
      const start = new Date(this.contractStartDate);
      start.setMonth(start.getMonth() + contractDurationNum);
      contractEndDate = start.toISOString().slice(0, 10);
    }

    const amountNum = this.contractAmount ? parseInt(this.contractAmount, 10) : 0;

    const payload = {
      voucher_date: this.voucherDate,
      voucher_number: this.voucherNumber,
      service_id: this.serviceName,
      cust_name: this.customerName,
      cust_mobile: this.customerMobile,
      contact_number: this.alternateContact,
      description: this.contractDescription,
      contract_start_date: this.contractStartDate,
      contract_end_date: contractEndDate,
      contract_duration: contractDurationNum,
      amount: amountNum,
      address: this.address,
      tnc: this.termsConditions,
      is_add_items: this.addProducts,
      is_service_call: this.addScheduleService,
      items: this.addProducts
        ? this.products.filter((p) => p.product).map((p) => ({
            item_id: p.product,
            description: p.description,
            quantity: p.quantity,
          }))
        : [],
      service_calls: this.addScheduleService
        ? this.serviceCalls.filter((call) => call.serviceDate).map((call) => ({
            service_type: call.serviceType,
            service_date: call.serviceDate,
            purpose: call.purpose,
            description: call.description || '',
            status: call.status || 'PENDING',
          }))
        : [],
    };

    if (this.isEditMode) {
      this.servicesService.editrequest(this.orgid, this.serviceVoucherId, payload).subscribe({
        next: (res) => {
          this.err.showToast('Service Voucher Updated!', 'success');
          this.router.navigate(['/vouchers']);
        },
        error: (err) => {
          this.err.showToast('Failed to update Service Voucher', err);
        },
      });
    } else {
      this.servicesService.addservice(this.orgid, payload).subscribe({
        next: (res) => {
          this.err.showToast('Service Voucher Saved!', res);
          this.router.navigate(['/vouchers']);
        },
        error: (err) => {
          this.err.showToast('Failed to save Service Voucher', err);
        },
      });
    }
  }

  onAddProductsCheckboxChange() {
    if (this.addProducts && this.products.length === 0) {
      this.products.push({ product: '', description: '', quantity: 1 });
    }
    if (!this.addProducts) {
      this.products = [];
    }
  }

  onAddProductRow() {
    this.products.push({ product: '', description: '', quantity: 1 });
  }

  onRemoveProduct(index: number) {
    this.products.splice(index, 1);
    this.productErrors.splice(index, 1);
  }

  onAddScheduleServiceCheckboxChange() {
    if (this.addScheduleService && this.serviceCalls.length === 0) {
      this.serviceCalls.push({ serviceDate: '', serviceType: 'SCHEDULED', purpose: '', description: '', status: 'PENDING' });
    }
    if (!this.addScheduleService) {
      this.serviceCalls = [];
    }
  }

  onAddServiceCall() {
    this.serviceCalls.push({ serviceDate: '', serviceType: 'SCHEDULED', purpose: '', description: '', status: 'PENDING' });
  }

  onRemoveServiceCall(index: number) {
    this.serviceCalls.splice(index, 1);
    this.serviceCallErrors.splice(index, 1);
  }

  get isViewMode() {
    return this.mode === 'view';
  }
  get isEditMode() {
    return this.mode === 'edit';
  }
  cleanRTL(text: string) {
    return text.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
  }
}