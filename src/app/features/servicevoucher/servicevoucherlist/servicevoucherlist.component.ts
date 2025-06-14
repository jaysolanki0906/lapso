import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonTableCardComponent, TableTab, TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationService } from '../../../core/services/organization.service';
import { ServicevoucherService } from '../../../core/services/servicevoucher.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-servicevoucherlist',
  standalone: true,
  imports: [
    CommonTableCardComponent,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './servicevoucherlist.component.html',
  styleUrl: './servicevoucherlist.component.scss'
})
export class ServicevoucherlistComponent implements OnInit, OnDestroy {
  // tabs: TableTab[] = [
  //   { label: 'Active', value: 'ACTIVE' },
  //   { label: 'Inactive', value: 'INACTIVE' }
  // ];
  activeTab = 'ACTIVE';

  searchFields = [
    { placeholder: 'Search by Service or Code', key: 'query' }
  ];

  columns: TableColumn[] = [
    { key: 'voucher_date', label: 'Voucher Date' },
    { key: 'voucher_number', label: 'Voucher Number' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'service_name', label: 'Service Name' },
    { key: 'cust_name', label: 'Customer Name' },
    { key: 'cust_mobile', label: 'Customer Mobile' },
    { key: 'status', label: 'Status' },
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

  constructor(
    private servicesService: ServicevoucherService,
    private organizationService: OrganizationService,
    private router: Router,
    private err:ErrorHandlerService
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
    this.servicesService.getItems(this.orgId, {
      search: this.searchQuery,
      offset,
      limit: this.pageSize,
      status: this.activeTab,
    }).subscribe(
      (res: any) => {
        this.allData = (res.items || res.data || []).map((item: any) => ({
          ...item,
          // Map service_name from org_service_plan if not present at root
          service_name: item.service_name || item.org_service_plan?.service_name || '',
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
    this.router.navigate(['servicevoucher', 'add']); 
  }

  onEdit(row: any) {
    this.router.navigate(['servicevoucher', 'edit', row.id]); 
  }

  getStatusText(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'ACTIVE': return 'Active';
      case 'INACTIVE': return 'Inactive';
      case 'EXPIRED': return 'Expired';
      case 'CANCELLED': return 'Cancelled';
      default: return status || '';
    }
  }

  onView(row: any) {
    this.router.navigate(['servicevoucher', 'view', row.id]); 
  }

  onDelete(row: any) {
    // Show confirmation dialog
    Swal.fire({
      title: 'Delete Confirmation',
      text: 'Are you sure you want to delete this Service Voucher?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleting = true;
        this.servicesService.deleterequest(this.orgId, row.id)
          .pipe(finalize(() => this.deleting = false))
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Service Voucher has been deleted.', 'success');
              this.fetchItems();
            },
            error: (error) => {
              this.err.showToast(error,'error');
            }
          });
      }
    });
  }

  onToggle(payload: any) {
    // 
    
  }
}