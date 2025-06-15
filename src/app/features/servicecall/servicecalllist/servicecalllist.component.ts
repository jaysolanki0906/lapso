import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ServicecallService } from '../../../core/services/servicecall.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { Subscription } from 'rxjs';
import { TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-servicecalllist',
  templateUrl: './servicecalllist.component.html',
  standalone: false,
  styleUrls: ['./servicecalllist.component.scss']
})
export class ServicecalllistComponent implements OnInit, OnDestroy {
  columns: TableColumn[] = [
    { key: 'service_date', label: 'Service Date', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'customer_number', label: 'Customer Number' },
    { key: 'complaints_source', label: 'Raised By' },
    { key: 'user_details.fullname', label: 'Assigned To' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'status', label: 'Status' },
  ];
  formMode: 'add' | 'edit' | 'view' = 'add';
  formHeading = 'Add Service Call';
  selectedServiceCall: any = null;

  searchFields = [
    { placeholder: 'Search by customer or service', key: 'search' }
  ];

  filteredData: any[] = [];
  page = 1;
  pageSize = 20;
  total = 0;
  orgId = '';
  orgSub: Subscription | null = null;
  loading = false;
  searchQuery = '';
  submitting = false;

  selectedVoucherId: string = '';
  serviceCall: any = {};

  // Sorting state
  sortColumn: string = 'service_date'; // default sorted by service_date
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private servicecallService: ServicecallService,
    private organizationService: OrganizationService,
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
    this.servicecallService.getItems(this.orgId, {
  search: this.searchQuery,            // <-- searching by text
  offset,
  limit: this.pageSize,
  order_by: this.sortColumn,           // <-- sorting by field name
  order_type: this.sortDirection,      // <-- sorting direction
}).subscribe(res => {
      this.filteredData = res.data || [];
      this.total = res.count || this.filteredData.length;
      this.loading = false;
    }, _ => {
      this.loading = false;
    });
  }

  onSearch(searchObj: any) {
    this.searchQuery = searchObj.search || '';
    this.page = 1;
    this.fetchItems();
  }

  onClear() {
    this.searchQuery = '';
    this.page = 1;
    this.fetchItems();
  }

  onPageChange(event: any) {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.fetchItems();
  }

  // Sorting handler for table
  onSort(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.page = 1;
    this.fetchItems();
  }

  onAddServiceCall() {
    this.formMode = 'add';
    this.formHeading = 'Add Service Call';
    this.selectedServiceCall = null;
    this.openOffcanvas();
  }

  onEdit(row: any) {
    this.formMode = 'edit';
    this.formHeading = 'Edit Service Call';
    this.selectedServiceCall = row;
    this.openOffcanvas();
  }

  onView(row: any) {
    const orgId = row.org_id || this.orgId;
    const voucherId = row.service_voucher_id || (row.service_vouchers && row.service_vouchers.id);
    const callId = row.id;
    if (!orgId || !voucherId || !callId) {
      Swal.fire('Error', 'Missing identifiers for service call.', 'error');
      return;
    }

    Swal.fire({
      title: 'Loading...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.servicecallService.fetchcall(orgId, voucherId, callId).subscribe(
      (call: any) => {
        Swal.close();
        const voucher = call.service_vouchers || {};
        this.selectedVoucherId = voucher.id;
        this.serviceCall = { ...call };

        // Render services table rows if available
        let servicesTableRows = '';
        if (Array.isArray(call.services) && call.services.length > 0) {
          servicesTableRows = call.services.map((service: any) => `
            <tr>
              <td style="padding: 4px 8px;">${service.action_date || ''}</td>
              <td style="padding: 4px 8px;">${service.observation || ''}</td>
              <td style="padding: 4px 8px;">${service.action_taken || ''}</td>
              <td style="padding: 4px 8px;">${service.attachment ? `<a href="${service.attachment}" target="_blank">View</a>` : ''}</td>
              <td style="padding: 4px 8px;">${service.status || ''}</td>
            </tr>
          `).join('');
        } else {
          servicesTableRows = `<tr><td colspan="5" style="text-align:center;color:#7b7b7b;padding:16px 0;">No Services found</td></tr>`;
        }

        Swal.fire({
          title: '<span style="font-size:1.3rem;font-weight:600;">Service calls</span>',
          html: `
            <div style="margin: 10px 0 0 0;">
              <div style="display: flex; justify-content: space-between;">
                <div style="width: 48%;">
                  <div style="margin-bottom:8px;"><b>Voucher Date</b> <span style="float:right;color:#7b7b7b;">${voucher.voucher_date || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Voucher Number</b> <span style="float:right;color:#7b7b7b;">${voucher.voucher_number || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Customer Name</b> <span style="float:right;color:#7b7b7b;">${voucher.cust_name || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Customer Mobile Number</b> <span style="float:right;color:#7b7b7b;">${voucher.cust_mobile || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Service Name</b> <span style="float:right;color:#7b7b7b;">${voucher.org_service_plan?.service_name || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Contract Start Date</b> <span style="float:right;color:#7b7b7b;">${voucher.contract_start_date || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Contract Expiry</b> <span style="float:right;color:#7b7b7b;">${voucher.contract_end_date || ''}</span></div>
                </div>
                <div style="width: 48%;">
                  <div style="margin-bottom:8px;"><b>Service Date</b> <span style="float:right;color:#7b7b7b;">${call.service_date || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Service Type</b> <span style="float:right;color:#7b7b7b;">${call.service_type === 'SCHEDULED' ? 'Scheduled' : (call.service_type || '')}</span></div>
                  <div style="margin-bottom:8px;"><b>Purpose</b> <span style="float:right;color:#7b7b7b;">${call.purpose || ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Completed Date</b> <span style="float:right;color:#7b7b7b;">${call.completion_date ? (call.completion_date.split('T')[0]) : ''}</span></div>
                  <div style="margin-bottom:8px;"><b>Status</b> <span style="float:right;color:#7b7b7b;">${call.status === 'PENDING' ? 'Pending' : (call.status || '')}</span></div>
                </div>
              </div>
              <hr style="margin:16px -16px 8px -16px;">
              <div>
                <table style="width:100%;border-collapse:collapse;">
                  <thead>
                    <tr style="text-align:left;">
                      <th style="padding: 4px 8px;">Action Date</th>
                      <th style="padding: 4px 8px;">Observation</th>
                      <th style="padding: 4px 8px;">Action Taken</th>
                      <th style="padding: 4px 8px;">Attachment</th>
                      <th style="padding: 4px 8px;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${servicesTableRows}
                  </tbody>
                </table>
              </div>
              <hr style="margin:8px -16px 0 -16px;">
              <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
                <button id="deleteCallBtn" style="background:#d33;color:white;padding:8px 20px;border-radius:5px;border:none;font-weight:600;cursor:pointer;">
                  Delete
                </button>
                <button id="voucherDetailBtn" style="background:#ff4250;color:white;padding:8px 20px;border-radius:5px;border:none;font-weight:600;cursor:pointer;">
                  View Voucher Details
                </button>
              </div>
            </div>
          `,
          showConfirmButton: false,
          width: 700,
          didOpen: () => {
            document.getElementById('deleteCallBtn')?.addEventListener('click', () => {
              this.onDelete();
            });
            document.getElementById('voucherDetailBtn')?.addEventListener('click', () => {
              if (voucher.id) {
                window.location.href = `/servicevoucher/view/${voucher.id}`;
              }
            });
          }
        });
      },
      error => {
        Swal.fire('Error', 'Could not load service call details.', 'error');
      }
    );
  }

  onDelete(row?: any) {
    const orgid = this.orgId;
    if (row) {
      const voucherId = row.service_voucher_id || (row.service_vouchers && row.service_vouchers.id);
      this.selectedVoucherId = voucherId;
      this.serviceCall = { ...row };
    }
    const vid = this.selectedVoucherId;
    const id = this.serviceCall.id;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the service call.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        if (!orgid || !vid || !id) {
          Swal.fire('Error', 'Required identifiers are missing.', 'error');
          return;
        }
        this.submitting = true;
        this.servicecallService.deletecall(orgid, vid, id).subscribe(
          res => {
            this.submitting = false;
            Swal.fire('Deleted!', 'Service call has been deleted.', 'success');
            this.fetchItems();
          },
          err => {
            this.submitting = false;
            Swal.fire('Error', 'Failed to delete service call.', 'error');
          }
        );
      }
    });
  }

  openOffcanvas() {
    setTimeout(() => {
      (window as any).bootstrap
        ?.Offcanvas.getOrCreateInstance(
          document.getElementById('serviceCallOffcanvas')
        )
        .show();
    }, 0);
  }

  onFormUpdate() {
    this.closeOffcanvas();
    this.fetchItems();
  }

  closeOffcanvas() {
    (window as any).bootstrap
      ?.Offcanvas.getOrCreateInstance(
        document.getElementById('serviceCallOffcanvas')
      )
      .hide();
  }
}