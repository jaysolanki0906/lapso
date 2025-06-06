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

@Component({
  selector: 'app-products-send',
  standalone: true,
  imports: [
    CommonTableCardComponent,
    HeaderComponent,
    SidebarComponent,
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
    { key: 'productName', label: 'Product Name' },
    { key: 'productCode', label: 'Product Code' },
    { key: 'brand', label: 'Brand' },
    { key: 'category', label: 'Category' }
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

  constructor(
    private productService: ProductService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    // Subscribe once to organization changes
    this.orgSub = this.organizationService.organization$.subscribe(org => {
      if (org && org.org_id) {
        this.orgId = org.org_id;
        this.fetchData();
      }
    });
  }

  ngOnDestroy() {
    this.orgSub?.unsubscribe();
  }

  fetchData() {
    if (!this.orgId) {
      this.allData = [];
      this.filteredData = [];
      this.total = 0;
      return;
    }
    this.loading = true;
    const offset = (this.page - 1) * this.pageSize;
    this.productService.getItems(this.orgId, {
      search: this.searchQuery,
      offset,
      limit: this.pageSize,
      status: this.activeTab,
    }).subscribe(
      (res: any) => {
        this.allData = res.items || res.data || [];
        this.filteredData = this.allData;
        this.total = res.total || this.filteredData.length;
        this.loading = false;
      },
      _ => { this.loading = false; }
    );
  }

  onTabChange(tabValue: string) {
    this.activeTab = tabValue;
    this.page = 1;
    this.fetchData();
  }

  onSearch(searchObj: any) {
    this.searchQuery = searchObj.query || '';
    this.page = 1;
    this.fetchData();
  }

  onClear() {
    this.searchQuery = '';
    this.page = 1;
    this.fetchData();
  }

  onPageChange(event: { page: number, pageSize: number }) {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.fetchData();
  }

  onEdit(row: any) { alert('Edit: ' + JSON.stringify(row)); }
  onView(row: any) { alert('View: ' + JSON.stringify(row)); }
  onDelete(row: any) { alert('Delete: ' + JSON.stringify(row)); }
  onToggle(event: any) { alert('Toggle: ' + JSON.stringify(event)); }
}