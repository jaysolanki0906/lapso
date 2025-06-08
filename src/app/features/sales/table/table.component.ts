import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonTableCardComponent, TableColumn } from '../../../shared/common-table-card/common-table-card.component';
import { OrganizationService } from '../../../core/services/organization.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SalesFormComponent } from '../sales-form/sales-form.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonTableCardComponent,
    SalesFormComponent
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  formHeading = 'Sales Voucher';
  orgSub: any;
  orgId: string = '';
  showForm = false;
  editVoucherId: string | null = null;

  searchFields = [
    { placeholder: 'Search by Customer or Voucher', key: 'query' }
  ];

  columns: TableColumn[] = [
    { key: 'cust_name', label: 'Customer Name' },
    { key: 'cust_mobile', label: 'Customer Mobile' },
    { key: 'voucher_number', label: 'Voucher Number' },
    { key: 'voucher_date', label: 'Voucher Date' },
    { key: 'created_at', label: 'Created Date' }
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
  }

  fetchItems() {
    this.invoice.getdata(this.orgId, this.page, this.pageSize).subscribe({
      next: (data: any) => {
        this.filteredData = data.rows;
        this.total = data.total;
      },
      error: (error: any) => {
        this.err.showToast('Error fetching data:', error);
      }
    });
  }

  onPageChange(event: { page: number, pageSize: number }) {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.fetchItems();
  }

  onAddProduct() {
    this.editVoucherId = null;
    this.showForm = true;
  }

  onEdit(event: any) {
    this.editVoucherId = event.id; // id = voucherId
    this.showForm = true;
  }

  onFormDone() {
    this.showForm = false;
    this.editVoucherId = null;
    this.fetchItems();
  }

  onCloseForm() {
    this.showForm = false;
    this.editVoucherId = null;
  }

  onTabChange(event: any) {}
  onSearch(event: any) {}
  onClear() {}
  onView(event: any) {}
  onDelete(event: any) {}
  onToggle(event: any) {}
}