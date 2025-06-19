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
import { SearchField } from '../../../shared/common-table-card/common-table-card.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { RolePermissionService } from '../../../core/services/role-permission.service';
import { ServicesModule } from '../../services/services.module';
import { ServicesService } from '../../../core/services/services.service';

@Component({
  selector: 'app-servicevoucherlist',
  standalone: false,
  templateUrl: './servicevoucherlist.component.html',
  styleUrl: './servicevoucherlist.component.scss'
})
export class ServicevoucherlistComponent implements OnInit, OnDestroy {
  activeTab = 'ACTIVE';

  v_Date = '';
  m_val = '';
  status = '';
  s_name = '';
  c_date = '';
  v_c_date = '';
  voucher_start_date = '';
  idval='';
voucher_end_date = '';
contract_expiry_start_date = '';
contract_expiry_end_date = '';
created_at_start_date = '';
created_at_end_date = '';
selectedCallRow: any = null;

  searchFields: SearchField[] = [
    { title: 'Service Name', placeholder: 'Service Name', type: 'dropdown', key: 'quary2', options: [] },
    { title: 'Customer No, Name or Voucher No', type: 'text', placeholder: 'Customer No, Name or Voucher No', key: 'query' },
    { title: 'Status', placeholder: 'Status', type: 'dropdown', key: 'status',multiple: false,options: [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' }
] },
    { title: 'Voucher Date', placeholder: 'Voucher Date', type: 'date', key: 'Voucher_Date' },
    { title: 'Contract Expiry', placeholder: 'Contract Expiry', type: 'date', key: 'Contract_Expiry' },
    { title: 'Voucher Created Date', placeholder: 'Voucher Created Date', type: 'date', key: 'Voucher_Created_Date' }
  ];

  columns: TableColumn[] = [
    { key: 'voucher_date', label: 'Voucher Date', sortable: true },
    { key: 'voucher_number', label: 'Voucher Number' },
    { key: 'created_at', label: 'Created Date', sortable: true },
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
  sortColumn: string = 'created_at'; 
  sortDirection: 'asc' | 'desc' = 'desc';
  canEdit = false;
  canDelete = false;
  canView = false;
  canCreate = false;

  constructor(
    private servicesService: ServicevoucherService,
    private organizationService: OrganizationService,
    private router: Router,
    private err: ErrorHandlerService,
    private role: RolePermissionService,
    private service: ServicesService
  ) {}

  ngOnInit() {
    this.orgSub = this.organizationService.organization$.subscribe(org => {
      if (org && org.org_id) {
        this.orgId = org.org_id;
        this.fetchItems();
        this.values(org.org_id);
      }
    });
    this.canCreate = this.role.getPermission("service_voucher", "service_voucher_create");
    this.canView = this.role.getPermission("service_voucher", "service_voucher_view");
    this.canEdit = this.role.getPermission("service_voucher", "service_voucher_edit");
    this.canDelete = this.role.getPermission("service_voucher", "service_voucher_delete");
  }

  ngOnDestroy() {
    this.orgSub?.unsubscribe();
  }

  onSort(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.page = 1;
    this.fetchItems();
  }

  values(orgid: string) {
    this.service.getItems(orgid, { status: "ACTIVE" }).subscribe({
      next: (res) => {
        const serviceNames = res.data.map((data: any) => data.service_name);
        const options = ['All', ...serviceNames];
        this.searchFields = this.searchFields.map(field =>
          field.key === 'quary2' ? { ...field, options } : field)
      },
    });
  }

  fetchItems() {
    if (this.status == 'All') {
      this.status = '';
    }
    if (this.s_name == 'All') {
      this.s_name = '';
    }
    if (!this.orgId) return;

    this.loading = true;
    const offset = (this.page - 1) * this.pageSize;

    const filters: any = {
      offset,
      limit: this.pageSize,
      search: this.m_val,
      service_name: this.s_name,
      order_by: this.sortColumn,     // <- pass the sort column
      order_type: this.sortDirection,
      status: this.status.toUpperCase(),
      voucher_start_date: this.voucher_start_date,
    voucher_end_date: this.voucher_end_date,
    contract_expiry_start_date: this.contract_expiry_start_date,
    contract_expiry_end_date: this.contract_expiry_end_date,
    created_at_start_date: this.created_at_start_date,
    created_at_end_date: this.created_at_end_date
    };


    Object.keys(filters).forEach(key => {
      if (filters[key] === '' || filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    this.servicesService.getItems(this.orgId, filters).subscribe(
      (res: any) => {
        this.allData = (res.items || res.data || []).map((item: any) => ({
          ...item,
          service_name: item.service_name || item.org_service_plan?.service_name || '',
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

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    return `${year}-${month}-${day}`; // For API, use yyyy-mm-dd (adjust if API expects dd/mm/yyyy)
  }

  onSearch(searchValues: { [key: string]: any }) {
    this.s_name = searchValues['quary2'];
    this.m_val = searchValues['query'];
    this.status = searchValues['status'];
    this.page = 1;
    if (
    searchValues['Voucher_Date'] &&
    typeof searchValues['Voucher_Date'] === 'object' &&
    searchValues['Voucher_Date'].start &&
    searchValues['Voucher_Date'].end
  ) {
    this.voucher_start_date = this.formatDate(searchValues['Voucher_Date'].start);
    this.voucher_end_date = this.formatDate(searchValues['Voucher_Date'].end);
  } else {
    this.voucher_start_date = '';
    this.voucher_end_date = '';
  }

  // Contract Expiry Date Range
  if (
    searchValues['Contract_Expiry'] &&
    typeof searchValues['Contract_Expiry'] === 'object' &&
    searchValues['Contract_Expiry'].start &&
    searchValues['Contract_Expiry'].end
  ) {
    this.contract_expiry_start_date = this.formatDate(searchValues['Contract_Expiry'].start);
    this.contract_expiry_end_date = this.formatDate(searchValues['Contract_Expiry'].end);
  } else {
    this.contract_expiry_start_date = '';
    this.contract_expiry_end_date = '';
  }

  if (
    searchValues['Voucher_Created_Date'] &&
    typeof searchValues['Voucher_Created_Date'] === 'object' &&
    searchValues['Voucher_Created_Date'].start &&
    searchValues['Voucher_Created_Date'].end
  ) {
    this.created_at_start_date = this.formatDate(searchValues['Voucher_Created_Date'].start);
    this.created_at_end_date = this.formatDate(searchValues['Voucher_Created_Date'].end);
  } else {
    this.created_at_start_date = '';
    this.created_at_end_date = '';
  }
    this.fetchItems();
  }

  onClear() {
    this.c_date = '';
    this.status = '';
    this.v_Date = '';
    this.v_c_date = '';
    this.s_name = '';
    this.m_val = '';
    this.page = 1;
    this.voucher_start_date = '';
    this.voucher_end_date = '';
    this.contract_expiry_start_date = '';
    this.contract_expiry_end_date = '';
    this.created_at_start_date = '';
    this.created_at_end_date = '';
    this.fetchItems();
  }

  onPageChange(event: { page: number, pageSize: number }) {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.fetchItems();
  }
  onServiceCallAdded(){
    // this.closeOffcanvas();
  }
  onCall(row: any) {
  this.selectedCallRow = row;
  this.idval=row.id;
  
  // Open the offcanvas by id
  const offcanvasElement = document.getElementById('serviceCallOffcanvas');
  if (offcanvasElement && (window as any).bootstrap?.Offcanvas) {
    const bsOffcanvas = new (window as any).bootstrap.Offcanvas(offcanvasElement);
    bsOffcanvas.show();
  } else {
    console.error('Offcanvas element or Bootstrap Offcanvas not available');
  }
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

  async onDelete(row: any) {
    const isConfirmed = await this.err.confirmSwal('Delete', 'Are you sure you waht tot delete', `${row.voucher_number}`);
    if (isConfirmed) {
      this.deleting = true;
      this.servicesService.deleterequest(this.orgId, row.id)
        .pipe(finalize(() => this.deleting = false))
        .subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Service Voucher has been deleted.', 'success');
            this.fetchItems();
          },
          error: (error) => {
            this.err.showToast(error, 'error');
          }
        });
    }
  }
}