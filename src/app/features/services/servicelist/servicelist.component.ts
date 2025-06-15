import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonTableCardComponent, TableTab, TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationService } from '../../../core/services/organization.service';
import { ServicesService } from '../../../core/services/services.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-servicelist',
  standalone: false,
  templateUrl: './servicelist.component.html',
  styleUrl: './servicelist.component.scss'
})
export class ServicelistComponent implements OnInit, OnDestroy {
  tabs: TableTab[] = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];
  activeTab = 'ACTIVE';
  sortColumn: string = 'service_name'; // default sort on load
sortDirection: 'asc' | 'desc' = 'asc';

  searchFields = [
    { placeholder: 'Search by Service or Code', key: 'query' }
  ];

  columns: TableColumn[] = [
    { key: 'service_name', label: 'Service Name',sortable: true },
    { key: 'description', label: 'Description' },
  ];

  allData: any[] = [];
  filteredData: any[] = [];
  page = 1;
  pageSize = 20;
  total = 0;
  searchQuery = '';
  loading = false;

  orgId: string = '';
  orgSub: Subscription | null = null;

  formMode: 'add' | 'edit' | 'view' = 'add';
  formHeading = 'Add Service';
  selectedService: any = null;
  deleting = false;
  togglingId: number | null = null;

  constructor(
    private servicesService: ServicesService,
    private organizationService: OrganizationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.orgSub = this.organizationService.organization$.subscribe(org => {
      if (org && org.org_id) {
        this.orgId = org.org_id;
        this.fetchItems();
      }
    });
    this.cdr.detectChanges();
  }
  
  ngOnDestroy() {
    this.orgSub?.unsubscribe();
  }

  fetchItems() {
  if (!this.orgId) return;
  this.loading = true;
  const offset = (this.page - 1) * this.pageSize;
  this.servicesService.getItems(this.orgId, {
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
        categoryTitle: item.service_details?.title ?? '',
      }));
      this.filteredData = this.allData;
      this.total = res.total || this.allData.length;
      this.loading = false;
    },
    _ => { this.loading = false; }
  );
}
  onSort(event: { column: string, direction: 'asc' | 'desc' }) {
  this.sortColumn = event.column;
  this.sortDirection = event.direction;
  this.page = 1;
  this.fetchItems();
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
    this.router.navigate(['service', 'add']); 
  }
  onEdit(row: any) {
    this.router.navigate(['service', 'edit', row.id]); 
  }

  // You may keep view logic similar if you use a view route
  onView(row: any) {
  Swal.fire({
    title: 'Services',
    html: `
      <div style="text-align: left;">
        <div style="margin-bottom: 16px;">
          <strong>Service Name</strong>
          <span style="margin-left: 30px; color: #666;">${row.service_name || ''}</span>
        </div>
        <div style="margin-bottom: 16px;">
          <strong>Contract Description</strong>
          <span style="margin-left: 10px; color: #666;">${row.description || ''}</span>
        </div>
        <div style="margin-bottom: 16px;">
          <strong>Terms & Condition</strong>
          <textarea 
            class="form-textarea" 
            style="width:100%;margin-top:5px;height:70px;resize:none;" 
            placeholder="Insert text here ..." 
            readonly>${row.terms_and_conditions || ''}</textarea>
        </div>
        <div style="margin-top: 32px;">
          <strong>Status</strong>
          <span style="margin-left: 60px; color: #228B22;">${row.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    width: 600,
    customClass: {
      popup: 'swal2-service-view-popup'
    }
  });
}

  onDelete(payload: any) {
     const row = this.filteredData.find(item => item.id === payload.id);
    if (!row) return;

    // Save old status in case API fails
    const oldStatus = row.status;
    row.status = payload.status;
    row.toggling = true;

    this.servicesService.deleteService(this.orgId, row.id).pipe(
      finalize(() => row.toggling = false)
    ).subscribe({
      next: () => {
        this.fetchItems();
      },
      error: err => {
        row.status = oldStatus;
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    });
  }

  onToggle(payload: any) {
    // Find the toggled row in filteredData to optimistically update UI
    const row = this.filteredData.find(item => item.id === payload.id);
    if (!row) return;

    // Save old status in case API fails
    const oldStatus = row.status;
    row.status = payload.status;
    row.toggling = true;

    this.servicesService.updateservice(this.orgId, row.id, {
      service_name: row.service_name,
      status: payload.status
    }).pipe(
      finalize(() => row.toggling = false)
    ).subscribe({
      next: () => {
        this.fetchItems();
      },
      error: err => {
        row.status = oldStatus;
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    });
  }
}