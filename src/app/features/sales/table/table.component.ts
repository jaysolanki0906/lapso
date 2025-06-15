import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonTableCardComponent, TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import { OrganizationService } from '../../../core/services/organization.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  formHeading = 'Sales Voucher';
  orgSub: any;
  orgId: string = '';
  showForm = false;
  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

 searchFields = [
  { title: 'Voucher Number', placeholder: 'Voucher Number', key: 'invoice_number' },
  { title: 'Mobile Number', placeholder: 'Mobile Number', key: 'mobile' },
];

  searchValues: { [key: string]: string } = {};

  columns: TableColumn[] = [
    { key: 'cust_name', label: 'Customer Name' },
    { key: 'cust_mobile', label: 'Customer Mobile' },
    { key: 'voucher_number', label: 'Voucher Number', sortable: true},
    { key: 'voucher_date', label: 'Voucher Date', sortable: true},
    { key: 'created_at', label: 'Created Date', sortable: true}
  ];

  filteredData: any[] = [];
  total = 0;
  page = 1;
  pageSize = 20;

  constructor(
    private organizationService: OrganizationService,
    private invoice: InvoiceService,
    private err: ErrorHandlerService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orgSub = this.organizationService.organization$.subscribe(org => {
      if (org && org.org_id) {
        this.orgId = org.org_id;
        this.fetchItems();
        this.cdRef.detectChanges(); // Fixes ExpressionChangedAfterItHasBeenCheckedError
      }
    });

    this.searchFields.forEach(f => this.searchValues[f.key] = '');
  }

  fetchItems(searchObj?: { [key: string]: string }) {
  const params: any = {
    page: this.page,
    pageSize: this.pageSize
  };
  if (searchObj) {
    Object.assign(params, searchObj);
  }
  // Add sorting params if set
  if (this.sortColumn) {
    params.order_by = this.sortColumn;
    params.order_type = this.sortDirection;
  }
  this.invoice.getdata(this.orgId, params.page, params.pageSize, params).subscribe({
    next: (data: any) => {
      this.filteredData = data.rows;
      this.total = data.total;
    },
    error: (error: any) => {
      this.err.showToast('Error fetching data:', error);
    }
  });
}
  onSort(event: { column: string, direction: 'asc' | 'desc' }) {
  this.sortColumn = event.column;
  this.sortDirection = event.direction;
  this.page = 1;
  this.fetchItems(this.searchValues);
}

  onSearch(event: { [key: string]: string }) {
  const hasAnyValue = Object.values(event).some(val => val && val.trim() !== '');
  if (hasAnyValue) {
    this.page = 1;
    this.fetchItems(event); 
  }
}

  onClear() {
  this.page = 1;
  this.fetchItems({});
}

  onPageChange(event: { page: number, pageSize: number }) {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.fetchItems(this.searchValues);
  }

  onAddProduct() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  onEdit(event: any) {
  this.router.navigate(['edit', event.id], { relativeTo: this.route });
}

  onFormDone() {
    this.showForm = false;
    this.fetchItems(this.searchValues);
  }

  onCloseForm() {
    this.showForm = false;
  }

  onTabChange(event: any) {}
  async onDelete(event: any) {
    const conf=await this.err.confirmSwal('Delet voucher',`Are you sure you want to delete voucher number `,`${event.voucher_number}`);
    if (conf) {
    this.invoice.deletinvoice(this.orgId,event.id).subscribe({
      next: res => {
        this.fetchItems(this.searchValues);
      },
      error: err => {}
    });
    }
}
  onToggle(event: any) {}

  onView(event: any) {
    this.invoice.editvoucher(this.orgId, event.id).subscribe({
      next: (voucher: any) => {
        this.showVoucherSwal(voucher);
      },
      error: () => {
        Swal.fire('Error', 'Failed to load voucher details', 'error');
      }
    });
  }


  showVoucherSwal(voucher: any) {
    // Extract the first asset for table row (if any)
    const assets = voucher.assets || [];
    const mainAsset = assets[0] || {};
    const doc = mainAsset.attachment_details || {};
    const pdfUrl = doc.file_url
      ? `/api/${doc.file_url}` // Adjust as needed for your real file serving
      : null;
    // Format main voucher details
    const mainTable = `
      <table style="width:100%;margin-bottom:12px;">
        <tr>
          <td><b>Customer Name</b></td>
          <td>${voucher.cust_name || ''}</td>
          <td><b>Invoice Date</b></td>
          <td>${this.formatDate(voucher.voucher_date)}</td>
          <td><b>Invoice Number</b></td>
          <td>${voucher.voucher_number || ''}</td>
        </tr>
        <tr>
          <td><b>Mobile Number</b></td>
          <td>${voucher.cust_mobile || ''}</td>
          <td><b>Accepted Status</b></td>
          <td>
            <span style="padding:4px 8px;border:1px solid #ffa726;border-radius:10px;color:#ffa726;font-size:12px;">
              ${voucher.accept_status || 'Pending'}
            </span>
          </td>
          <td><b>Invoice</b></td>
          <td>
            ${pdfUrl ? `<a href="${pdfUrl}" target="_blank">${doc.doc_name || 'bill.pdf'}</a>` : '-'}
          </td>
        </tr>
      </table>
    `;
    // Format asset/items table
    const itemTable = `
      <table style="width:100%;margin-bottom:12px;text-align:left;">
        <thead>
          <tr>
            <th>Item</th>
            <th>Warranty Expired Date</th>
            <th>Guarantee Expired Date</th>
            <th>Description</th>
            <th>Status</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Tax</th>
          </tr>
        </thead>
        <tbody>
          ${assets.map((item: any) => {
            const vi = item.voucher_items || {};
            return `
              <tr>
                <td>${vi.title || item.title || '-'}</td>
                <td>${vi.warranty_expiry || item.warranty_expiry || '-'}</td>
                <td>${vi.guarantee_expiry || item.guarantee_expiry || '-'}</td>
                <td>${vi.desc || item.desc || '-'}</td>
                <td>
                  <span style="padding:4px 8px;border:1px solid #ffa726;border-radius:10px;color:#ffa726;font-size:12px;">
                    ${item.accept_status || voucher.accept_status || 'Pending'}
                  </span>
                </td>
                <td>${vi.qty || 1}</td>
                <td>${vi.price || item.price || '-'}</td>
                <td>${vi.tax || item.tax ? (vi.tax || item.tax) + '%' : '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    // Amounts
    const amounts = `
      <hr style="border: 2px solid #fa2237;">
      <div style="display:flex;justify-content:space-between;margin-top:8px;">
        <div><b>Net Amount:</b> ${voucher.pretax_amount || voucher.item_total || 0}</div>
        <div><b>Tax Amount:</b> ${voucher.tax_amount || voucher.tax_total || 0}</div>
        <div><b>Grand Total:</b> ${voucher.total_amount || 0}</div>
      </div>
    `;
    Swal.fire({
      html: `
        <div style="text-align:left;">
          <div style="font-weight:bold;font-size:18px;margin-bottom:8px;">Voucher</div>
          ${mainTable}
          <hr>
          ${itemTable}
          ${amounts}
        </div>
      `,
      width: 900,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-wide'
      }
    });
  }

  formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  }
}