import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';
import { InvoiceService } from '../../../core/services/invoice.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { FormComponent as ProductFormComponent } from '../../product/form/form.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './sales-form.component.html',
  imports: [ReactiveFormsModule, CommonModule, ProductFormComponent],
  styleUrls: ['./sales-form.component.scss'],
  standalone: true,
})
export class SalesFormComponent implements OnInit, OnChanges {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() orgId: string = '';
  @Input() dataUrl: string | null = null;
  @Output() updateNeeded = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  invoiceForm: FormGroup;
  products: any[] = [];
  customerSuggestions: any[] = [];
  customerSearchLoading = false;

  netAmount: number = 0;
  taxAmount: number = 0;
  grandTotal: number = 0;

  formHeading = 'Add Product';
  formMode: 'add' | 'edit' | 'view' = 'add';
  selectedProduct: any = null;

  constructor(
    private fb: FormBuilder,
    private invoiceservice: InvoiceService,
    private organisationService: OrganizationService,
  ) {
    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en-IN');
    this.invoiceForm = this.fb.group({
      invoiceDate: [today, Validators.required],
      invoiceNumber: ['', Validators.required],
      customerName: ['', Validators.required],
      customerMobile: [{ value: '', disabled: true }, Validators.required],
      note: [''],
      items: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    if (this.orgId) {
      this.fetchproduct(this.orgId);
      if (this.mode === 'edit' && this.dataUrl) {
        this.loadDataFromUrl(this.orgId, this.dataUrl);
      } else {
        this.fetchAndSetInvoiceNumber(this.orgId);
        this.initItems();
      }
    }

    this.invoiceForm.get('customerName')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(val => val?.trim()),
      filter(val => !!val && val.length > 2),
      switchMap(val => {
        if (this.orgId) {
          this.customerSearchLoading = true;
          return this.invoiceservice.fetchcontact(this.orgId, val);
        }
        return of({ data: [] });
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.mode === 'edit' &&
      this.orgId &&
      this.dataUrl &&
      (changes['orgId'] || changes['dataUrl'] || changes['mode'])
    ) {
      this.loadDataFromUrl(this.orgId, this.dataUrl);
    }
    if (
      this.mode === 'add' &&
      (changes['orgId'] || changes['dataUrl'] || changes['mode'])
    ) {
      this.fetchAndSetInvoiceNumber(this.orgId);
      this.initItems();
    }
  }

  loadDataFromUrl(orgId: string, dataUrl: string) {
    // dataUrl: "abc/vouchers/xyz"
    const parts = dataUrl.split('/');
    const cust_id = parts[parts.length - 1];
    this.invoiceservice.editvoucher(orgId, cust_id).subscribe({
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
    return this.fb.group({
      product: [null, Validators.required],
      description: [''],
      warrantyChecked: [false],
      warrantyType: ['Days'],
      warrantyPeriod: [''],
      guaranteeChecked: [false],
      guaranteeType: ['Days'],
      guaranteePeriod: [''],
      quantity: [1, Validators.required],
      unit: ['Unit'],
      price: [''],
      tax: [''],
      total: [{ value: '', disabled: true }],
    });
  }

  addItem() {
    this.items.push(this.createItemGroup());
    this.calculateTotals();
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
    this.cancel.emit();
  }

  onProductSelected(item: AbstractControl, productId: string) {
    const group = item as FormGroup;
    const product = this.products.find((p: any) => p.id === productId);
    if (product) {
      group.patchValue({
        description: product.description || '',
        price: product.price || '',
        tax: product.tax || '',
        warrantyChecked: product.has_warranty,
        warrantyType:
          product.warranty_unit === 'DAYS'
            ? 'Days'
            : product.warranty_unit === 'MONTHS'
              ? 'Months'
              : 'Years',
        warrantyPeriod: product.has_warranty ? product.warranty_value : '',
        guaranteeChecked: product.has_guarantee,
        guaranteeType:
          product.guarantee_unit === 'DAYS'
            ? 'Days'
            : product.guarantee_unit === 'MONTHS'
              ? 'Months'
              : 'Years',
        guaranteePeriod: product.has_guarantee ? product.guarantee_value : '',
        unit: 'Unit',
        total: product.price || '',
      });
    } else {
      group.patchValue({
        description: '',
        price: '',
        tax: '',
        warrantyChecked: false,
        warrantyType: 'Days',
        warrantyPeriod: '',
        guaranteeChecked: false,
        guaranteeType: 'Days',
        guaranteePeriod: '',
        unit: 'Unit',
        total: '',
      });
    }
    this.calculateTotals();
  }

  getTotalControl(item: AbstractControl): FormControl {
    return item.get('total') as FormControl;
  }

  initItems() {
    while (this.items.length) this.items.removeAt(0);
    this.addItem();
  }

  patchFormForEdit(voucher: any) {
    while (this.items.length) this.items.removeAt(0);

    this.invoiceForm.patchValue({
      invoiceDate: voucher.voucher_date || formatDate(new Date(), 'yyyy-MM-dd', 'en-IN'),
      invoiceNumber: voucher.voucher_number || '',
      customerName: voucher.cust_name || '',
      customerMobile: voucher.cust_mobile || '',
      note: voucher.note || '',
    });

    if (voucher.assets && Array.isArray(voucher.assets) && voucher.assets.length) {
      voucher.assets.forEach((asset: any) => {
        const voucherItem = asset.voucher_items || {};
        const group = this.createItemGroup();
        group.patchValue({
          product: asset.product_id || voucherItem.product_id || null,
          description: asset.desc || voucherItem.desc || '',
          warrantyChecked: asset.has_warranty || voucherItem.has_warranty || false,
          warrantyType: this.reverseWarrantyUnit(asset.warranty_unit || voucherItem.warranty_unit),
          warrantyPeriod: asset.warranty_value || voucherItem.warranty_value || '',
          guaranteeChecked: asset.has_guarantee || voucherItem.has_guarantee || false,
          guaranteeType: this.reverseWarrantyUnit(asset.guarantee_unit || voucherItem.guarantee_unit),
          guaranteePeriod: asset.guarantee_value || voucherItem.guarantee_value || '',
          quantity: voucherItem.qty || 1,
          unit: voucherItem.unit || 'Unit',
          price: voucherItem.price || asset.price || '',
          tax: voucherItem.tax || asset.tax || '',
          total: voucherItem.total_price || asset.total_price || ''
        });
        this.items.push(group);
      });
    } else {
      this.addItem();
    }
    this.calculateTotals();
  }

  fetchproduct(orgid: string) {
    this.invoiceservice.filtertostoreproduct(orgid).subscribe({
      next: (data: any) => {
        this.products = Array.isArray(data) ? data : data?.data ?? [];
      },
      error: (err: any) => {
        alert('Error fetching products');
      },
    });
  }

  onCustomerSuggestionSelect(cust: any) {
    this.invoiceForm.patchValue({
      customerName: cust.name,
      customerMobile: cust.mobile
    });
    this.invoiceForm.get('customerName')!.disable();
    this.customerSuggestions = [];
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
    this.fetchproduct(this.orgId);
  }

  onSubmitInvoice() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en-IN');
    const formVal = this.invoiceForm.getRawValue();

    const items = formVal.items.map((item: any) => ({
      item_id: item.product,
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

    this.invoiceservice.savevincoice(this.orgId, payload).subscribe({
      next: (res) => {
        alert('Invoice saved successfully!');
        this.updateNeeded.emit();
      },
      error: (err) => {
        alert('Error saving invoice!');
      }
    });
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
}