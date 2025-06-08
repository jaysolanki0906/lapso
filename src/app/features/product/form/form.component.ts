import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../../../core/services/organization.service';

interface Category {
  id: number;
  title: string;
  desc?: string | null;
  image?: string;
}

interface Brand {
  id: number;
  title: string;
  desc?: string | null;
  logo?: string;
  categories?: string;
  products?: number[];
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit, OnChanges {
  @Input() orgId: string | null = null;
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() productData: any = null;
  @Output() updateNeeded = new EventEmitter<void>();

  product = {
    category: null as Category | null,
    categoryId: null as number | null,
    brand: null as Brand | null,
    brandId: null as number | null,
    productName: '',
    productCode: '',
    modelNumber: '',
    description: null,
    price: '',
    tax: '',
    hasWarranty: false,
    warrantyUnit: 'DAYS',
    warranty: null as number | null,
    hasGuarantee: false,
    guaranteeUnit: 'DAYS',
    guarantee: null as number | null,
    status: true
  };

  products: any[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  submitting = false;
  deleting = false;
  private pendingPatch: any = null;

  constructor(
    private productService: ProductService,
    private organisation: OrganizationService
  ) {}

  ngOnInit() {
    this.productService.fetchcategory().subscribe((data: any[]) => {
      this.products = data;

      const catMap = new Map<number, Category>();
      data.forEach(item => {
        if (item.category && !catMap.has(item.category.id)) {
          catMap.set(item.category.id, item.category);
        }
      });
      this.categories = Array.from(catMap.values());

      const brandMap = new Map<number, Brand>();
      data.forEach(item => {
        if (item.brands && item.brands.length > 0) {
          item.brands.forEach((brand: Brand) => {
            if (!brandMap.has(brand.id)) {
              brandMap.set(brand.id, brand);
            }
          });
        }
      });
      this.brands = Array.from(brandMap.values());
      if (this.pendingPatch) {
        this.patchFormWithProductData(this.pendingPatch);
        this.pendingPatch = null;
      } else if (this.productData) {
        this.patchFormWithProductData(this.productData);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productData'] && this.productData) {
      if (!this.categories.length || !this.brands.length) {
        this.pendingPatch = this.productData;
      } else {
        this.patchFormWithProductData(this.productData);
      }
    }
    if (changes['mode'] && this.mode === 'add') {
      this.resetForm();
    }
  }

  patchFormWithProductData(data: any) {
    if (!this.categories.length || !this.brands.length) {
      this.pendingPatch = data;
      return;
    }
    const catId = typeof data.product_id === 'string' ? parseInt(data.product_id, 10) : data.product_id;
    const brandId = typeof data.brand_id === 'string' ? parseInt(data.brand_id, 10) : data.brand_id;
    const fallbackCatId = typeof data.categoryId === 'string' ? parseInt(data.categoryId, 10) : data.categoryId;
    const fallbackBrandId = typeof data.brandId === 'string' ? parseInt(data.brandId, 10) : data.brandId;

    const category = this.categories.find(c => c.id === (catId ?? fallbackCatId)) ?? null;
    const brand = this.brands.find(b => b.id === (brandId ?? fallbackBrandId)) ?? null;

    this.product = {
      category,
      categoryId: catId ?? fallbackCatId ?? null,
      brand,
      brandId: brandId ?? fallbackBrandId ?? null,
      productName: data.name ?? data.productName ?? '',
      productCode: data.code ?? data.productCode ?? '',
      modelNumber: data.model_number ?? data.modelNumber ?? '',
      description: data.description ?? null,
      price: data.price !== undefined && data.price !== null ? data.price : '',
      tax: data.tax !== undefined && data.tax !== null ? String(data.tax) : '',
      hasWarranty: !!(data.has_warranty ?? data.hasWarranty),
      warrantyUnit: data.warranty_unit ?? data.warrantyUnit ?? 'DAYS',
      warranty: data.warranty_value ?? data.warranty ?? null,
      hasGuarantee: !!(data.has_guarantee ?? data.hasGuarantee),
      guaranteeUnit: data.guarantee_unit ?? data.guaranteeUnit ?? 'DAYS',
      guarantee: data.guarantee_value ?? data.guarantee ?? null,
      status: data.status ?? true
    };
  }

  resetForm() {
    this.product = {
      category: null,
      categoryId: null,
      brand: null,
      brandId: null,
      productName: '',
      productCode: '',
      modelNumber: '',
      description: null,
      price: '',
      tax: '',
      hasWarranty: false,
      warrantyUnit: 'DAYS',
      warranty: null,
      hasGuarantee: false,
      guaranteeUnit: 'DAYS',
      guarantee: null,
      status: true
    };
  }

  onCategoryChange() {
    this.product.categoryId = this.product.category ? this.product.category.id : null;
  }

  onBrandChange() {
    this.product.brandId = this.product.brand ? this.product.brand.id : null;
  }

  private normalizeProduct(obj: any): any {
    return {
      brand_id: obj.brandId ?? null,
      code: obj.productCode === '' ? null : obj.productCode,
      description: obj.description === '' ? null : obj.description,
      guarantee_unit: obj.guaranteeUnit === '' ? null : obj.guaranteeUnit,
      guarantee_value: obj.hasGuarantee ? (obj.guarantee === '' ? null : obj.guarantee) : null,
      has_guarantee: !!obj.hasGuarantee,
      has_warranty: !!obj.hasWarranty,
      model_number: obj.modelNumber === '' ? null : obj.modelNumber,
      name: obj.productName === '' ? null : obj.productName,
      price: obj.price === '' ? null : obj.price,
      product_id: obj.categoryId ?? null,
      status: obj.status ?? true,
      tax: obj.tax === '' ? 0 : +obj.tax,
      warranty_unit: obj.warrantyUnit === '' ? null : obj.warrantyUnit,
      warranty_value: obj.hasWarranty ? (obj.warranty === '' ? null : obj.warranty) : null,
    };
  }

  closeDialog() {
    const offcanvas = (window as any).bootstrap?.Offcanvas.getInstance(
      document.getElementById('addProductOffcanvas')
    );
    if (offcanvas) {
      offcanvas.hide();
    }
  }

  onSubmit(form: any) {
    if (form.invalid || !this.orgId || this.mode === 'view') return;
    this.submitting = true;
    const payload = this.normalizeProduct(this.product);

    if (this.mode === 'edit' && this.productData && this.productData.id) {
      this.productService.updateProduct(this.orgId, this.productData.id, payload).subscribe({
        next: (res) => {
          this.submitting = false;
          form.resetForm();
          this.closeDialog();
          this.updateNeeded.emit();
        },
        error: () => {
          this.submitting = false;
        }
      });
    } else if (this.mode === 'add') {
      this.productService.addproduct(this.orgId, payload).subscribe({
        next: (res) => {
          this.submitting = false;
          form.resetForm();
          this.closeDialog();
          this.updateNeeded.emit();
        },
        error: () => {
          this.submitting = false;
        }
      });
    }
  }

  onDelete() {
    if (!this.orgId || !this.productData || !this.productData.id) return;
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.deleting = true;
    this.productService.deleteProduct(this.orgId, this.productData.id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.updateNeeded.emit();
        this.closeDialog();
      },
      error: () => {
        this.deleting = false;
      }
    });
  }
}