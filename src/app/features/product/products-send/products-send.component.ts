import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableTab, TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import { ProductService } from '../../../core/services/product.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { finalize } from 'rxjs/operators';
import { RolePermissionService } from '../../../core/services/role-permission.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-products-send',
  templateUrl: './products-send.component.html',
  styleUrl: './products-send.component.scss',
  standalone: false,
})
export class ProductsSendComponent implements OnInit, OnDestroy {

  @ViewChild('productForm') productFormComponent!: FormComponent;
  private offcanvasHiddenHandler: any;
  tabs: TableTab[] = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];
  activeTab = 'ACTIVE';


  searchFields = [
    { title: 'Product or Code', placeholder: 'Search by Product or Code', key: 'query' }
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'code', label: 'Product Code',sortable:true },
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

  // Sorting
  sortColumn: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  canEdit = false;
  canDelete = false;
  canView = false;
  canCreate = false;

  constructor(
    private productService: ProductService,
    private organizationService: OrganizationService,
    private role: RolePermissionService,
    private err: ErrorHandlerService,
  ) {}

  ngOnInit() {
    this.orgSub = this.organizationService.organization$.subscribe(org => {
      if (org && org.org_id) {
        this.orgId = org.org_id;
        this.fetchItems();
      }
    });

    // Set permissions
    this.canCreate = this.role.getPermission("product", "product_create");
    this.canEdit = this.role.getPermission("product", "product_edit");
    this.canView = this.role.getPermission("product", "product_view");
    this.canDelete = this.role.getPermission("product", "product_delete");
  }

  fetchItems() {
    console.log(this.activeTab);
    if (!this.orgId) return;
    this.loading = true;
    const offset = (this.page - 1) * this.pageSize;
    this.productService.getItems(this.orgId, {
      search: this.searchQuery,
      offset,
      limit: this.pageSize,
      status: this.activeTab,
      order_by: this.sortColumn,
      order_type: this.sortDirection,
    }).subscribe(
      (res: any) => {
        this.allData = (res.items || res.data || []).map((item: any) => ({
          ...item,
          brandTitle: item.brand_details?.title ?? '',
          categoryTitle: item.product_details?.title ?? '',
        }));
        this.filteredData = this.allData;
        this.total = res.count ?? res.total ?? 0;
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
    // Do NOT call fetchItems() here, form will trigger updateNeeded after add.
  }

  onEdit(row: any) {
    this.formMode = 'edit';
    this.formHeading = 'Update Product';
    this.selectedProduct = row;
    this.openOffcanvas();
    // Do NOT call fetchItems() here, form will trigger updateNeeded after update.
  }

  onView(row: any) {
    this.formMode = 'view';
    this.formHeading = 'View Product';
    this.selectedProduct = row;
    this.openOffcanvas();
  }

  closemodule() {
    this.selectedProduct = null;
    this.formMode = 'add';
    // Hide the offcanvas
    const offcanvas = (window as any).bootstrap?.Offcanvas.getInstance(
      document.getElementById('addProductOffcanvas')
    );
    if (offcanvas) {
      offcanvas.hide();
    }
  }

  async onDelete(row: any) {
    if (!this.orgId || !row?.id) return;
    const bool: Boolean = await this.err.confirmSwal("Delete", 'Are you sure you want to delete ', `${row.name}`);
    this.deleting = true;
    if (bool)
      this.productService.deleteProduct(this.orgId, row.id).subscribe({
        next: () => {
          this.deleting = false;
          this.fetchItems(); 
          this.err.showToast('Your product is sucessfully deleted','success');
        },
        error: (err) => {
          this.deleting = false;
          this.err.showToast(err,'error');
        }
      });
  }

  async onToggle(event: { row: any, value: boolean, status: string }) {
    const statusactiveinactive=(this.activeTab=='ACTIVE'?'Inactive':'Active');
    const product = { ...event.row, status: event.status };
    if (!this.orgId || !product?.id) return;
    product.toggling = true;
    const confirm = await this.err.confirmSwal(
      'Toggle',
      `Are you sure you want to ${statusactiveinactive}`,
      `${event.row.name}`,
      'Yes'
    );
    if (confirm) {
      product.toggling = true;
      this.productService.updateProduct(this.orgId, product.id, product)
        .pipe(finalize(() => { product.toggling = false; }))
        .subscribe({
          next: () => {
            this.fetchItems();
            this.err.showToast("The action is completed",'success')
          },
          error: (err) => {
            this.err.showToast(err, 'warning');
            product.toggle=false;
            event.row.status = event.value ? 'INACTIVE' : 'ACTIVE';
            this.filteredData = [...this.filteredData];
          }
        });
    } else {
      // Revert the toggle
      product.toggle=false;
      event.row.status = event.value ? 'INACTIVE' : 'ACTIVE';
      this.filteredData = [...this.filteredData];
    }
  }

  onSort(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.page = 1;
    this.fetchItems();
  }
  ngAfterViewInit() {
  const offcanvasEl = document.getElementById('addProductOffcanvas');
  if (offcanvasEl) {
    this.offcanvasHiddenHandler = () => {
      if (this.productFormComponent) {
        this.productFormComponent.resetForm();
      }
      this.fetchItems();
    };
    offcanvasEl.addEventListener('hidden.bs.offcanvas', this.offcanvasHiddenHandler);
  }
}

  ngOnDestroy() {
    const offcanvasEl = document.getElementById('addProductOffcanvas');
    if (offcanvasEl && this.offcanvasHiddenHandler) {
      offcanvasEl.removeEventListener('hidden.bs.offcanvas', this.offcanvasHiddenHandler);
    }
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