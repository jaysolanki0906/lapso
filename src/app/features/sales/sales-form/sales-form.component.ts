import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';
import { InvoiceService } from '../../../core/services/invoice.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { FormComponent as ProductFormComponent } from '../../product/form/form.component';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss'],
  standalone: false,
})
export class SalesFormComponent implements OnInit, OnDestroy {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() orgId: string = '';
  lastAddedProductId: string | null = null;
  productAddRowIndex: number | null = null;

  invoiceForm: FormGroup;
  showDropdown = false;
  dropdownHideTimeout: any;
  products: any[] = [];
  customerSuggestions: any[] = [];
  customerSearchLoading = false;
  formHeading: string = 'Add Product';
  formMode: 'add' | 'edit' | 'view' = 'add';
  selectedProduct: any = null;

  netAmount: number = 0;
  taxAmount: number = 0;
  grandTotal: number = 0;
  warrantyTouched = false;
  guaranteeTouched = false;

  voucherId: string | null = null;
  orgSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private invoiceservice: InvoiceService,
    private organisationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private err: ErrorHandlerService
  ) {
    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en-IN');
    this.invoiceForm = this.fb.group({
      invoiceDate: [today, Validators.required],
      invoiceNumber: ['', Validators.required],
      customerName: ['', Validators.required],
      customerMobile: ['', Validators.required],
      note: [''],
      items: this.fb.array([]),
    });
  }

 ngOnInit(): void {
    this.orgSub = this.organisationService.organization$.subscribe(org => {
      if (org && org.org_id) {
        this.orgId = org.org_id;

        this.voucherId = this.route.snapshot.paramMap.get('voucherId');
        this.fetchproduct(this.orgId).subscribe(() => {
          if (this.voucherId) {
            this.mode = 'edit';
            this.loadDataForEdit(this.orgId, this.voucherId);
          } else {
            this.mode = 'add';
            this.fetchAndSetInvoiceNumber(this.orgId);
            this.initItems();
          }
        });

        this.invoiceForm.get('customerName')!.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          map(val => val?.trim()),
          filter(val => !!val && val.length > 2),
          switchMap(val => {
            this.customerSearchLoading = true;
            return this.invoiceservice.fetchcontact(this.orgId, val);
          })
        ).subscribe({
          next: (res: any) => {
            this.customerSuggestions = res?.data ?? [];
            this.customerSearchLoading = false;
          },
          error: () => {
            this.customerSuggestions = [];
            this.customerSearchLoading = false;
          }
        });

        this.items.valueChanges.subscribe(() => this.calculateTotals());

        // For existing rows, set up price change listeners
        this.setupPriceChangeSubscriptions();
      }
    });
  }
  setupPriceChangeSubscriptions() {
    this.items.controls.forEach((group: AbstractControl, idx: number) => {
      const fg = group as FormGroup;
      // Remove previous subscription if needed (avoid duplicate logs)
      if ((fg as any)._priceSub) {
        (fg as any)._priceSub.unsubscribe();
      }
      (fg as any)._priceSub = fg.get('price')!.valueChanges.subscribe(val => {
        console.log(`Row ${idx + 1} price changed:`, val);
      });
    });
  }

  onCustomerInput(event: any) {
    this.showDropdown = true;
  }

  hideDropdownWithDelay() {
    this.dropdownHideTimeout = setTimeout(() => this.showDropdown = false, 150);
  }

  ngOnDestroy(): void {
    this.orgSub?.unsubscribe();
  }

  loadDataForEdit(orgId: string, voucherId: string) {
    this.invoiceservice.editvoucher(orgId, voucherId).subscribe({
      next: (data: any) => {
        if (data) {
          this.patchFormForEdit(data);
        }
      },
      error: (err: any) => {
        alert('Error fetching voucher for edit');
      }
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemGroup(): FormGroup {
    const item= this.fb.group({
      item_id: [''],
      product: ['', Validators.required], // always string for dropdown selection
      description: [''],
      warrantyChecked: [false],
      warrantyType: ['Days'],
      warrantyPeriod: [''],
      guaranteeChecked: [false],
      guaranteeType: ['Days'],
      guaranteePeriod: [''],
      quantity: [Validators.required,Validators.min(1)],
      unit: [],
      price: ['', [Validators.required, Validators.min(1)]],
      tax: [''],
      total: [{ value: '', disabled: true }],
    });
    item.get('price')?.valueChanges.subscribe(() => {
    this.updateTotal(item);
  });

  item.get('tax')?.valueChanges.subscribe(() => {
    this.updateTotal(item);
  });
  return item;
  }
updateTotal(item: FormGroup) {
  const price = +item.get('price')?.value || 0;
  const tax = +item.get('tax')?.value || 0;

  const total = price + (price * tax / 100);
  item.get('total')?.setValue(total.toFixed(2), { emitEvent: false });
}

  addItem() {
    const itemGroup = this.createItemGroup();
    this.items.push(itemGroup);
    this.setupPriceChangeSubscriptions();
  }
  updateRowTotal(itemGroup: FormGroup) {
  const price = parseFloat(itemGroup.get('price')?.value) || 0;
  const quantity = parseFloat(itemGroup.get('quantity')?.value) || 0;
  const tax = parseFloat(itemGroup.get('tax')?.value) || 0;

  const subtotal = price * quantity;
  const taxAmount = (subtotal * tax) / 100;
  const total = subtotal + taxAmount;

  // Update the total field without triggering another value change
  itemGroup.get('total')?.setValue(total.toFixed(2), { emitEvent: false });
  console.log(itemGroup)

  this.calculateTotals(); // If you also want grand totals updated
}


  fetchAndSetInvoiceNumber(orgId: string) {
    if (this.mode === 'add') {
      this.invoiceservice.assigninvoicenumber(orgId, 'INVOICE').subscribe({
        next: (data: any) => {
          const invoiceNumber = data?.voucher_number || data?.number || data;
          this.invoiceForm.get('invoiceNumber')?.setValue(invoiceNumber);
        },
        error: (err: any) => {
          alert('Error fetching invoice number');
        }
      });
    }
  }

  removeItem(i: number) {
    if (this.items.length > 1) {
      this.items.removeAt(i);
      this.calculateTotals();
    }
  }

  routeback() {
    this.router.navigate(['voucher/invoice']);
  }

 onProductSelected(item: AbstractControl, productId: string) {
  const group = item as FormGroup;
  // Always find the product fresh by ID
  const product = this.products.find((p: any) => String(p.id) === String(productId));
  if (product) {
    group.patchValue({
      item_id: product.id,
      product: product.id, // Only the id!
      description: product.description || '',
      price: product.price || '',
      tax: product.tax || '',
      warrantyChecked: !!product.has_warranty,
      warrantyType:
        product.warranty_unit === 'DAYS'
          ? 'Days'
          : product.warranty_unit === 'MONTHS'
            ? 'Months'
            : product.warranty_unit === 'YEARS'
              ? 'Years'
              : 'Days',
      warrantyPeriod: product.has_warranty ? product.warranty_value : '',
      guaranteeChecked: !!product.has_guarantee,
      guaranteeType:
        product.guarantee_unit === 'DAYS'
          ? 'Days'
          : product.guarantee_unit === 'MONTHS'
            ? 'Months'
            : product.guarantee_unit === 'YEARS'
              ? 'Years'
              : 'Days',
      guaranteePeriod: product.has_guarantee ? product.guarantee_value : '',
      unit: '',           // Set if your product has unit, else leave blank
      quantity: 1,        // Default to 1, or use product.quantity if you want
      total: product.price || '',
    }, { emitEvent: false }); // prevent valueChanges recursion
  } else {
    group.reset({
      item_id: '',
      product: '',
      description: '',
      price: '',
      tax: '',
      warrantyChecked: false,
      warrantyType: 'Days',
      warrantyPeriod: '',
      guaranteeChecked: false,
      guaranteeType: 'Days',
      guaranteePeriod: '',
      unit: '',
      quantity: 1,
      total: '',
    }, { emitEvent: false });
  }
  this.calculateTotals();
}

  getTotalControl(item: AbstractControl): FormControl {
    return item.get('total') as FormControl;
  }

  markWarrantyTouched() {
    this.warrantyTouched = true;
  }
  markGuaranteeTouched() {
    this.guaranteeTouched = true;
  }
  initItems() {
    while (this.items.length) this.items.removeAt(0);
    this.addItem();
    this.setupPriceChangeSubscriptions();
  }
onMobileInput(event: any) {
  let value = event.target.value;
  
  value = value.replace(/\D/g, '');
  
  if (value.length > 10) {
    value = value.substring(0, 10);
  }
  
  this.invoiceForm.get('customerMobile')?.setValue(value);
  
  event.target.value = value;
}

 patchFormForEdit(voucher: any) {
    this.invoiceForm.patchValue({
      invoiceDate: voucher.voucher_date || formatDate(new Date(), 'yyyy-MM-dd', 'en-IN'),
      invoiceNumber: voucher.voucher_number || '',
      customerName: voucher.cust_name || '',
      customerMobile: voucher.cust_mobile || '',
      note: voucher.note || '',
    });

    this.items.clear();

    if (voucher.assets) {
      voucher.assets.forEach((asset: any) => {
        const vi = asset.voucher_items || asset;
        const group = this.createItemGroup();
        group.patchValue({
          item_id: vi.item_id || '',
          product: vi.item_id,
          description: vi.desc || asset.desc || '',
          quantity: vi.qty || 1,
          unit: vi.unit || 'Pice',
          price: vi.price || '',
          tax: vi.tax || '',
          total: vi.total_price || '',
          warrantyChecked: vi.has_warranty,
          warrantyType: this.reverseWarrantyUnit(vi.warranty_unit),
          warrantyPeriod: vi.warranty_value || '',
          guaranteeChecked: vi.has_guarantee,
          guaranteeType: this.reverseWarrantyUnit(vi.guarantee_unit),
          guaranteePeriod: vi.guarantee_value || '',
        });
        this.items.push(group);
      });
    } else {
      this.addItem();
    }

    this.calculateTotals();
    this.setupPriceChangeSubscriptions();
  }


  fetchproduct(orgid: string): Observable<any> {
    return this.invoiceservice.filtertostoreproduct(orgid).pipe(
      map((data: any) => {
        this.products = (Array.isArray(data) ? data : data?.data ?? []).map((prod: any) => ({
          ...prod,
          id: String(prod.id),
        }));
        return this.products;
      })
    );
  }

  onCustomerSuggestionSelect(suggestion: any) {
    this.invoiceForm.patchValue({
      customerName: suggestion.name,
      customerMobile: suggestion.mobile
    });
    this.showDropdown = false;
    this.customerSuggestions = [];
    if (this.dropdownHideTimeout) clearTimeout(this.dropdownHideTimeout);
  }

  showSuggestions(): boolean {
    return this.customerSuggestions.length > 0 && !this.invoiceForm.get('customerName')?.disabled;
  }

  calculateTotals() {
    let net = 0;
    let tax = 0;
    let grand = 0;

    this.items.controls.forEach(item => {
      const price = parseFloat(item.get('price')?.value) || 0;
      const qty = parseFloat(item.get('quantity')?.value) || 1;
      const taxPercent = parseFloat(item.get('tax')?.value) || 0;
      const rowTotal = price * qty;
      const rowTax = (rowTotal * taxPercent) / 100;
      net += rowTotal;
      tax += rowTax;
    });

    grand = net + tax;
    this.netAmount = net;
    this.taxAmount = tax;
    this.grandTotal = grand;
  }

  fetchItems() {
    this.fetchproduct(this.orgId).subscribe();
  }

  onSubmitInvoice() {
    this.invoiceForm.markAllAsTouched(); 
  if (this.invoiceForm.invalid) {
    this.err.showToast?.('Please fill all required fields!', 'warning');
    return;
  }
    let valid = true;
    const itemsArray = this.items; 
    itemsArray.controls.forEach((item: AbstractControl, i: number) => {
      const group = item as FormGroup;
      if (item.get('warrantyChecked')?.value) {
        if (
          !item.get('warrantyType')?.value ||
          !item.get('warrantyPeriod')?.value ||
          +item.get('warrantyPeriod')?.value < 1
        ) {
          item.get('warrantyType')?.markAsTouched();
          item.get('warrantyPeriod')?.markAsTouched();
          valid = false;
        }
      }
      if (item.get('guaranteeChecked')?.value) {
        if (
          !item.get('guaranteeType')?.value ||
          !item.get('guaranteePeriod')?.value ||
          +item.get('guaranteePeriod')?.value < 1
        ) {
          item.get('guaranteeType')?.markAsTouched();
          item.get('guaranteePeriod')?.markAsTouched();
          valid = false;
        }
      }
      if (!item.get('product')?.value) {
        item.get('product')?.markAsTouched();
        valid = false;
      }
      if (!item.get('quantity')?.value || +item.get('quantity')?.value < 1) {
        item.get('quantity')?.markAsTouched();
        valid = false;
      }
    });
    if (!this.invoiceForm.get('customerName')?.value) {
      this.invoiceForm.get('customerName')?.markAsTouched();
      valid = false;
    }
    if (!this.invoiceForm.get('customerMobile')?.value) {
      this.invoiceForm.get('customerMobile')?.markAsTouched();
      valid = false;
    }
    if (!valid) {
      this.err.showToast?.('Please fill all required fields!', 'warning');
      return;
    }

    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en-IN');
    const formVal = this.invoiceForm.getRawValue();

    const items = formVal.items.map((item: any) => ({
      item_id: item.item_id,
      item_desc: this.getProductNameById(item.product),
      qty: Number(item.quantity) || 1,
      unit: item.unit || '',
      price: item.price || '0.00',
      tax: Number(item.tax) || 0,
      tax_price: Number(this.calculateTaxPrice(item.price, item.quantity, item.tax)),
      total_price: this.calculateTotalPrice(item.price, item.quantity, item.tax),
      has_warranty: !!item.warrantyChecked,
      warranty_value: Number(item.warrantyPeriod) || 0,
      warranty_unit: this.getWarrantyUnit(item.warrantyType),
      warranty_expiry: this.calculateWarrantyExpiry(formVal.invoiceDate, item.warrantyChecked, item.warrantyPeriod, item.warrantyType),
      has_guarantee: !!item.guaranteeChecked,
      guarantee_value: Number(item.guaranteePeriod) || 0,
      guarantee_unit: this.getWarrantyUnit(item.guaranteeType),
      guarantee_expiry: this.calculateGuaranteeExpiry(formVal.invoiceDate, item.guaranteeChecked, item.guaranteePeriod, item.guaranteeType),
      accept_status: 'PENDING',
      eye_info: null,
      points: null
    }));

    const payload = {
      voucher_date: formVal.invoiceDate || today,
      voucher_number: formVal.invoiceNumber,
      cust_name: formVal.customerName,
      cust_mobile: formVal.customerMobile,
      voucher_type: 'INVOICE',
      note: formVal.note,
      grand_total: this.grandTotal.toFixed(2),
      pretax_grand_total: this.netAmount.toFixed(2),
      total_tax: this.taxAmount.toFixed(2),
      accept_status: null,
      points: null,
      items
    };

    if (this.mode === 'edit' && this.voucherId) {
      this.invoiceservice.saveinvoice(this.orgId, this.voucherId, payload).subscribe({
        next: (res) => {
          this.err.showToast('Updated sucessfully','info');
          this.routeback();
        },
        error: (err) => {
          this.err.showToast(err,'error');
        }
      });
    } else {
      this.invoiceservice.savevincoice(this.orgId, payload).subscribe({
        next: (res) => {
          this.err.showToast('Invoice saved successfully!','success');
          this.routeback();
        },
        error: (err) => {
          this.err.showToast(err,'error');
        }
      });
    }
  }

  getWarrantyUnit(val: string) {
    if (!val) return '';
    if (typeof val !== 'string') return '';
    if (val.toLowerCase().startsWith('day')) return 'DAYS';
    if (val.toLowerCase().startsWith('month')) return 'MONTHS';
    if (val.toLowerCase().startsWith('year')) return 'YEARS';
    return val.toUpperCase();
  }

  reverseWarrantyUnit(val: string) {
    if (!val) return 'Days';
    if (val === 'DAYS') return 'Days';
    if (val === 'MONTHS') return 'Months';
    if (val === 'YEARS') return 'Years';
    return val;
  }

  getProductNameById(productId: number | string): string {
    const prod = this.products.find((p: any) => String(p.id) === String(productId));
    return prod?.name || '';
  }

  calculateTaxPrice(price: any, quantity: any, tax: any) {
    const p = parseFloat(price) || 0;
    const q = parseFloat(quantity) || 1;
    const t = parseFloat(tax) || 0;
    return ((p * q * t) / 100).toFixed(2);
  }

  calculateTotalPrice(price: any, quantity: any, tax: any) {
    const p = parseFloat(price) || 0;
    const q = parseFloat(quantity) || 1;
    const t = parseFloat(tax) || 0;
    return (p * q + (p * q * t) / 100).toFixed(2);
  }

  calculateWarrantyExpiry(invoiceDate: string, hasWarranty: boolean, warrantyValue: any, warrantyUnit: string) {
    if (!hasWarranty || !warrantyValue) return null;
    return this.addDurationToDate(invoiceDate, warrantyValue, warrantyUnit);
  }

  calculateGuaranteeExpiry(invoiceDate: string, hasGuarantee: boolean, guaranteeValue: any, guaranteeUnit: string) {
    if (!hasGuarantee || !guaranteeValue) return null;
    return this.addDurationToDate(invoiceDate, guaranteeValue, guaranteeUnit);
  }

  addDurationToDate(dateStr: string, value: number, unit: string) {
    if (!dateStr || !value || !unit) return null;
    const date = new Date(dateStr);
    switch (this.getWarrantyUnit(unit)) {
      case 'DAYS':
        date.setDate(date.getDate() + Number(value));
        break;
      case 'MONTHS':
        date.setMonth(date.getMonth() + Number(value));
        break;
      case 'YEARS':
        date.setFullYear(date.getFullYear() + Number(value));
        break;
      default:
        break;
    }
    return formatDate(date, 'yyyy-MM-dd', 'en-IN');
  }

  openProductAddCanvas(rowIndex: number) {
    this.productAddRowIndex = rowIndex;
    this.selectedProduct = null;
    this.formMode = 'add';
  }

 onProductAdded(newProduct: any) {
  if (newProduct && newProduct.id && this.productAddRowIndex !== null) {
    const itemGroup = this.items.at(this.productAddRowIndex);

    itemGroup.patchValue({
      product: String(newProduct.id), // This sets the dropdown
      item_id: newProduct.id,
      description: newProduct.description || '',
      price: newProduct.price || '',
      tax: newProduct.tax || '',
      warrantyChecked: !!newProduct.has_warranty,
      warrantyType: (newProduct.warranty_unit === 'DAYS')
        ? 'Days'
        : (newProduct.warranty_unit === 'MONTHS')
          ? 'Months'
          : (newProduct.warranty_unit === 'YEARS')
            ? 'Years'
            : 'Days',
      warrantyPeriod: newProduct.has_warranty ? newProduct.warranty_value : '',
      guaranteeChecked: !!newProduct.has_guarantee,
      guaranteeType: (newProduct.guarantee_unit === 'DAYS')
        ? 'Days'
        : (newProduct.guarantee_unit === 'MONTHS')
          ? 'Months'
          : (newProduct.guarantee_unit === 'YEARS')
            ? 'Years'
            : 'Days',
      guaranteePeriod: newProduct.has_guarantee ? newProduct.guarantee_value : '',
      unit: '',
      quantity: 1,
      total: newProduct.price || '',
    });
    this.onProductSelected(itemGroup, String(newProduct.id));
    this.productAddRowIndex = null;
  }
}
}