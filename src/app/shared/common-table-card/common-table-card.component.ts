import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip'; // Added for tooltips

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'status' | 'date' | 'currency'; // Added type support
  width?: string; // Added for column width control
}

export interface SearchField {
  title?: string;
  placeholder: string;
  key: string;
  icon?: string; // Added icon support for search fields
  type?: 'text' | 'email' | 'number' | 'date'; // Added input type support
}

export interface TableTab {
  label: string;
  value: string;
  icon?: string; // Added icon support for tabs
  count?: number; // Added count support for tabs
}

@Component({
  selector: 'app-common-table-card',
  templateUrl: './common-table-card.component.html',
  styleUrls: ['./common-table-card.component.scss'],
  standalone: true,
  imports: [
    MatTabsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTableModule, 
    MatSlideToggleModule, 
    MatProgressSpinnerModule,
    MatSelectModule, 
    MatPaginatorModule, 
    FormsModule,
    CommonModule,
    MatCardModule,
    MatTooltipModule // Added for tooltips
  ],
})
export class CommonTableCardComponent implements OnInit {
  @Input() tabs: TableTab[] = [];
  @Input() activeTab: string = '';
  @Input() tableTitle: string = 'Data Management'; // Added table title

  @Input() searchFields: SearchField[] = []; // Updated type
  searchValues: { [key: string]: string } = {};

  @Input() columns: TableColumn[] = [];

  @Input() data: any[] = [];
  @Input() total: number = 0;
  @Input() totalRecords: number = 0; // Added for better pagination info
  @Input() page: number = 1;
  @Input() pageSize: number = 20;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() loading: boolean = false;
  @Input() callbtn: boolean = false;

  @Input() showToggle: boolean = true;
  @Input() showSearch: boolean = true; // Added to control search visibility
  @Input() showPagination: boolean = true; // Added to control pagination visibility
  @Input() enableSorting: boolean = false; // Added sorting support

  // Event Emitters
  @Output() tabChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<{ [key: string]: string }>();
  @Output() clear = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<{ row: any, value: boolean }>();
  @Output() pageChange = new EventEmitter<{ page: number, pageSize: number }>();
  @Output() call = new EventEmitter<any>();
  @Output() sort = new EventEmitter<{ column: string, direction: 'asc' | 'desc' }>(); // Added sorting

  // Internal properties
  statusKey = 'status';
  currentSortColumn: string = '';
  currentSortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    // Initialize search values
    for (let field of this.searchFields) {
      this.searchValues[field.key] = '';
    }

    // Set totalRecords if not provided
    if (!this.totalRecords && this.total) {
      this.totalRecords = this.total;
    }
  }

  get selectedTabIndex(): number {
    return this.tabs.findIndex(tab => tab.value === this.activeTab);
  }

  get displayedColumns(): string[] {
    return [...this.columns.map(col => col.key), 'actions'];
  }

  // Tab Management
  onTabChangeMaterial(index: number) {
    if (this.tabs[index]) {
      this.activeTab = this.tabs[index].value;
      this.tabChange.emit(this.activeTab);
    }
  }

  onTabChange(tab: TableTab) {
    this.activeTab = tab.value;
    this.tabChange.emit(tab.value);
  }

  // Search Management
  onSearch() {
    this.search.emit(this.searchValues);
  }

  onClear() {
    for (let key in this.searchValues) {
      this.searchValues[key] = '';
    }
    this.clear.emit();
  }

  // Action Handlers
  onEdit(row: any) { 
    this.edit.emit(row); 
  }

  onView(row: any) { 
    this.view.emit(row); 
  }

  onDelete(row: any) { 
    this.delete.emit(row); 
  }

  onCall(row: any) { 
    this.call.emit(row); 
  }

  onToggle(row: any, event: any) {
    const payload = { 
      row: row, 
      value: event.checked,
      status: event.checked ? 'ACTIVE' : 'INACTIVE' 
    };
    this.toggle.emit(payload);
  }

  // Sorting Management
  onSort(column: TableColumn) {
    if (!this.enableSorting || !column.sortable) return;

    if (this.currentSortColumn === column.key) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column.key;
      this.currentSortDirection = 'asc';
    }

    this.sort.emit({
      column: column.key,
      direction: this.currentSortDirection
    });
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable || this.currentSortColumn !== column.key) {
      return 'sort';
    }
    return this.currentSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // Pagination Management
  onMaterialPage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.page = 1;
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }

  get totalPages(): number {
    const total = this.totalRecords || this.total;
    return Math.max(Math.ceil(total / this.pageSize), 1);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.page;
    let start = Math.max(current - 2, 1);
    let end = Math.min(start + 4, total);
    start = Math.max(end - 4, 1);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(pg: number) {
    if (pg < 1 || pg > this.totalPages || pg === this.page || this.loading) return;
    this.page = pg;
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }

  // Utility Methods
  getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? '';
  }

  // Track by function for performance
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // Status badge helper
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }

  // Format value based on column type
  formatValue(value: any, column: TableColumn): any {
    if (!value && value !== 0) return '-';

    switch (column.type) {
      case 'status':
        return value;
      case 'date':
        return new Date(value);
      case 'currency':
        return parseFloat(value) || 0;
      default:
        return value;
    }
  }

  // Check if search has active filters
  get hasActiveFilters(): boolean {
    return Object.values(this.searchValues).some(value => value && value.trim() !== '');
  }

  // Get current page info
  get currentPageInfo(): string {
    const total = this.totalRecords || this.total;
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, total);
    return `${start}-${end} of ${total}`;
  }

  // Math reference for template
  Math = Math;
}