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

@Component({
  selector: 'app-servicevoucherform',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, CKEditorModule],
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
  serviceName: string = '';
  contractStartDate: string = '';
  contractDuration: string = '';
  contractExpired: string = '';
  termsConditions: string = '';
  contractDescription: string = '';
  contractAmount: string = '';
  orgid: string = '';
  serviceOptions: Array<{ id: string; service_name: string }> = [];
  productOptions: Array<any> = [];
  contactOptions: Array<{ id: string; name: string; mobile: string; org_name: string }> = [];
  showContactDropdown: boolean = false;
  customerNameInput$ = new Subject<string>();
  customerSearchLoading: boolean = false;
  addProducts: boolean = false;
  addScheduleService: boolean = false;
  mode: 'view' | 'edit' | 'add' = 'view';
  products: Array<any> = [];
  serviceCalls: Array<{ serviceDate: string; serviceType: string; purpose: string; description?: string; user_id?: string; status?: string }> = [];
  serviceVoucherId: string = '';
  public Editor = ClassicEditor;
  public editorInstance: any; // Add this line
public editorConfig: any = {
  toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
};


  errors: { [key: string]: string } = {};
  productErrors: string[] = [];
  serviceCallErrors: string[] = [];
  fieldTouched: { [key: string]: boolean } = {};

  constructor(
    private servicesService: ServicevoucherService,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private err: ErrorHandlerService
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
    
  });
  

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  this.voucherDate = todayStr;
  this.contractStartDate = todayStr;
}
  // Validation helpers for template
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
      if (this.fieldTouched['voucherDate']) this.errors['voucherDate'] = 'Voucher Date is required';
      valid = false;
    }
    if (!this.voucherNumber) {
      if (this.fieldTouched['voucherNumber']) this.errors['voucherNumber'] = 'Voucher Number is required';
      valid = false;
    }
    if (!this.customerName) {
      if (this.fieldTouched['customerName']) this.errors['customerName'] = 'Customer Name is required';
      valid = false;
    }
    if (!this.customerMobile) {
      if (this.fieldTouched['customerMobile']) this.errors['customerMobile'] = 'Customer Mobile Number is required';
      valid = false;
    } else if (this.isInvalidMobile(this.customerMobile)) {
      if (this.fieldTouched['customerMobile']) this.errors['customerMobile'] = 'Enter a valid 10-digit mobile number';
      valid = false;
    }
    if (!this.alternateContact) {
      if (this.fieldTouched['alternateContact']) this.errors['alternateContact'] = 'Alternate Contact Number is required';
      valid = false;
    } else if (this.isInvalidMobile(this.alternateContact)) {
      if (this.fieldTouched['alternateContact']) this.errors['alternateContact'] = 'Enter a valid 10-digit number';
      valid = false;
    }
    if (!this.address) {
      if (this.fieldTouched['address']) this.errors['address'] = 'Address is required';
      valid = false;
    }
    if (!this.serviceName) {
      if (this.fieldTouched['serviceName']) this.errors['serviceName'] = 'Service Name is required';
      valid = false;
    }
    if (!this.contractStartDate) {
      if (this.fieldTouched['contractStartDate']) this.errors['contractStartDate'] = 'Contract Start Date is required';
      valid = false;
    }
    if (!this.contractDuration) {
      if (this.fieldTouched['contractDuration']) this.errors['contractDuration'] = 'Contract Duration is required';
      valid = false;
    } else if (this.isInvalidPositiveNumber(this.contractDuration)) {
      if (this.fieldTouched['contractDuration']) this.errors['contractDuration'] = 'Contract Duration must be a positive number';
      valid = false;
    }
    if (!this.termsConditions || !this.termsConditions.trim() || this.termsConditions === '<br>') {
      if (this.fieldTouched['termsConditions']) this.errors['termsConditions'] = 'Terms & Conditions are required';
      valid = false;
    }
    if (!this.contractAmount) {
      if (this.fieldTouched['contractAmount']) this.errors['contractAmount'] = 'Contract Amount is required';
      valid = false;
    } else if (this.isInvalidNonNegativeNumber(this.contractAmount)) {
      if (this.fieldTouched['contractAmount']) this.errors['contractAmount'] = 'Contract Amount must be a valid number';
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
    if (!this.validate()) {
      this.err.showToast('Please correct the errors in the form before saving.', 'error');
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
          this.err.showToast('Service Voucher Updated!', res);
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