import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonTableCardComponent, TableTab, TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent } from '../form/form.component';
import { ProductService } from '../../../core/services/product.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-products-send',
  standalone: true,
  imports: [
    CommonTableCardComponent,
    MatButtonModule,
    MatIconModule,
    FormComponent
  ],
  templateUrl: './products-send.component.html',
  styleUrl: './products-send.component.scss'
})
export class ProductsSendComponent implements OnInit, OnDestroy {
  tabs: TableTab[] = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];
  activeTab = 'ACTIVE';

  searchFields = [
    { placeholder: 'Search by Product or Code', key: 'query' }
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Product Name' },
    { key: 'code', label: 'Product Code' },
    { key: 'brandTitle', label: 'Brand' },
    { key: 'categoryTitle', label: 'Category' },
  ];

  allData: any[] = [];
  filteredData: any[] = [];
  page = 1;
  pageSize = 20;
  total = 0;
  searchQuery = '';
  loading = false;

  orgId: string | null = null;
  orgSub: Subscription | null = null;

  // For form popup
  formMode: 'add' | 'edit' | 'view' = 'add';
  formHeading = 'Add Product';
  selectedProduct: any = null;
  deleting = false;
  togglingId: number | null = null;

  constructor(
    private productService: ProductService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.orgSub = this.organizationService.organization$.subscribe(org => {
      if (org && org.org_id) {
        this.orgId = org.org_id;
        this.fetchItems();
      }
    });
  }

  ngOnDestroy() {
    this.orgSub?.unsubscribe();
  }

  fetchItems() {
    if (!this.orgId) return;
    this.loading = true;
    const offset = (this.page - 1) * this.pageSize;
    this.productService.getItems(this.orgId, {
      search: this.searchQuery,
      offset,
      limit: this.pageSize,
      status: this.activeTab,
    }).subscribe(
      (res: any) => {
        // Store the FULL object for edit/view, but decorate for display
        this.allData = (res.items || res.data || []).map((item: any) => ({
          ...item,
          brandTitle: item.brand_details?.title ?? '',
          categoryTitle: item.product_details?.title ?? '',
        }));
        this.filteredData = this.allData;
        this.total = res.total || this.allData.length;
        this.loading = false;
      },
      _ => { this.loading = false; }
    );
  }

  onTabChange(tabValue: string) {
    this.activeTab = tabValue;
    this.page = 1;
    this.fetchItems();
  }

  onSearch(searchObj: any) {
    this.searchQuery = searchObj.query || '';
    this.page = 1;
    this.fetchItems();
  }

  onClear() {
    this.searchQuery = '';
    this.page = 1;
    this.fetchItems();
  }

  onPageChange(event: { page: number, pageSize: number }) {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.fetchItems();
  }

  onAddProduct() {
    this.formMode = 'add';
    this.formHeading = 'Add Product';
    this.selectedProduct = null;
    this.openOffcanvas();
  }

  onEdit(row: any) {
    this.formMode = 'edit';
    this.formHeading = 'Update Product';
    this.selectedProduct = row;
    this.openOffcanvas();
  }

  onView(row: any) {
    this.formMode = 'view';
    this.formHeading = 'View Product';
    this.selectedProduct = row;
    this.openOffcanvas();
  }

  onDelete(row: any) {
    if (!this.orgId || !row?.id) return;
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.deleting = true;
    this.productService.deleteProduct(this.orgId, row.id).subscribe({
      next: () => {
        this.deleting = false;
        // Remove deleted item from the list
        this.filteredData = this.filteredData.filter(item => item.id !== row.id);
        this.allData = this.allData.filter(item => item.id !== row.id);
        this.total = this.total - 1;
      },
      error: () => {
        this.deleting = false;
      }
    });
  }

onToggle(product: any) {
  if (!this.orgId || !product?.id) return;
  product.toggling = true;
  this.productService.updateProduct(this.orgId, product.id, product)
    .pipe(finalize(() => { product.toggling = false; }))
    .subscribe({
      next: () => {
         this.fetchItems();
      },
      error: () => {
      }
    });
}
  

  openOffcanvas() {
    setTimeout(() => {
      (window as any).bootstrap
        ?.Offcanvas.getOrCreateInstance(
          document.getElementById('addProductOffcanvas')
        )
        .show();
    }, 0);
  }
}