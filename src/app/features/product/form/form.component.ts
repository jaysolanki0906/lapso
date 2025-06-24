import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../../../core/services/organization.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

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
  @Output() updateNeeded = new EventEmitter<any>();
  warrantyTouched = false;
  guaranteeTouched = false;

  product = {
    category: null as Category | null,
    categoryId: null as number | null,
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
  filteredBrands: Brand[] = []; // Used to store brands associated with selected product
  submitting = false;
  deleting = false;
  selectedBrandIds: number[] = [];
  pendingPatch: any = null;

  prodBrandMap: { id: number; title: string; brands: Brand[] }[] = [];

  constructor(
    private productService: ProductService,
    private organisation: OrganizationService,
    private err:ErrorHandlerService,
  ) {}
  
  markWarrantyTouched() {
    this.warrantyTouched = true;
  }
  markGuaranteeTouched() {
    this.guaranteeTouched = true;
  }

  ngOnInit() {
    this.productService.fetchcategory().subscribe((data: any[]) => {
      this.products = data;

      this.prodBrandMap = data
        .filter(item => item.id)
        .map(item => ({
          id: item.id,
          title: item.title,
          brands: item.brands || []
        }));

      this.categories = this.prodBrandMap.map(item => ({
        id: item.id,
        title: item.title
      }));

      // All brands (flat for other use-cases)
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

      // Patch form if needed after loading categories and brands
      if (this.pendingPatch) {
        this.patchFormWithProductData(this.pendingPatch);
        this.pendingPatch = null;
      } else if (this.productData) {
        this.patchFormWithProductData(this.productData);
      }
    });
  }

  // When a product is selected, filter brands associated with that product
  onCategorySelect(categoryId: number) {
    const parent = this.prodBrandMap.find(item => item.id === categoryId);
    this.filteredBrands = parent ? parent.brands : [];
    this.selectedBrandIds = [];
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
    const fallbackCatId = typeof data.categoryId === 'string' ? parseInt(data.categoryId, 10) : data.categoryId;
    const category = this.categories.find(c => c.id === (catId ?? fallbackCatId)) ?? null;

    this.product = {
      ...this.product,
      category,
      categoryId: catId ?? fallbackCatId ?? null,
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

    if (this.product.categoryId) {
      this.onCategorySelect(this.product.categoryId);
    }

    if (Array.isArray(data.brand_ids)) {
      this.selectedBrandIds = data.brand_ids;
    } else if (data.brand_id) {
      this.selectedBrandIds = [data.brand_id];
    } else {
      this.selectedBrandIds = [];
    }
  }

  resetForm() {
    this.product = {
      category: null,
      categoryId: null,
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
    this.selectedBrandIds = [];
    this.filteredBrands = [];
  }

  onCategoryChange() {
    this.product.categoryId = this.product.category ? this.product.category.id : null;
    if (this.product.categoryId) {
      this.onCategorySelect(this.product.categoryId);
    } else {
      this.filteredBrands = [];
      this.selectedBrandIds = [];
    }
  }

  onBrandIdsChange(e: Event) {
    // For <select multiple>
    const selectElem = e.target as HTMLSelectElement;
    this.selectedBrandIds = Array.from(selectElem.selectedOptions).map(opt => +opt.value);
  }

  private normalizeProduct(obj: any): any {
    return {
      brand_id: this.selectedBrandIds, // send all selected brand IDs
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
  

  closeDialog(form:any) {
    form.resetForm();
    console.log("this is close form");
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
    if (this.product.hasWarranty) this.warrantyTouched = true;
    if (this.product.hasGuarantee) this.guaranteeTouched = true;
    if (this.product.hasWarranty && (!this.product.warrantyUnit || !this.product.warranty || this.product.warranty < 1)) {
      this.submitting = false;
      return;
    }
    if (this.product.hasGuarantee && (!this.product.guaranteeUnit || !this.product.guarantee || this.product.guarantee < 1)) {
      this.submitting = false;
      return;
    }
    if (this.mode === 'edit' && this.productData && this.productData.id) {
      this.productService.updateProduct(this.orgId, this.productData.id, payload).subscribe({
        next: (res) => {
          this.submitting = false;
          form.resetForm();
          this.closeDialog(form);
        this.updateNeeded.emit(res);
          this.err.showToast("Edit is done sucessfully",'success');
          // window.location.reload();

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
          this.closeDialog(form);
          this.updateNeeded.emit(res);
          this.err.showToast('added sucessfully','success');
          //  window.location.reload();
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
        this.closeDialog('');
      },
      error: () => {
        this.deleting = false;
      }
    });
  }
}