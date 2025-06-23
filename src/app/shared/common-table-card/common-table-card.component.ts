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
import { IgxDateRangePickerModule } from 'igniteui-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'status' | 'date' | 'currency';
  width?: string;
}

export interface SearchFieldOption {
  value: string;
  label: string;
}

export interface SearchField {
  title?: string;
  placeholder: string;
  key: string;
  icon?: string;
  multiple?: boolean,
  type?: 'text' | 'email' | 'number' | 'date' | 'dropdown';
  options?: (SearchFieldOption)[];
}

export interface TableTab {
  label: string;
  value: string;
  icon?: string;
  count?: number;
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
    MatTooltipModule,
    MatDatepickerModule,
    IgxDateRangePickerModule
  ],
})
export class CommonTableCardComponent implements OnInit {
  @Input() tabs: TableTab[] = [];
  @Input() activeTab: string = '';
  @Input() actionbtn:boolean=false;
  @Input() tableTitle: string = 'Data Management'; 
  @Input() searchFields: SearchField[] = [];
  searchValues: { [key: string]: string } = {};
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() total: number = 0;
  @Input() totalRecords: number = 0;
  @Input() page: number = 1;
  @Input() pageSize: number = 3;
  @Input() pageSizeOptions: number[] = [3,10, 20, 50, 100];
  @Input() loading: boolean = false;
  @Input() callbtn: boolean = false;
  @Input() showToggle: boolean = true;
  @Input() showSearch: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() enableSorting: boolean = true;
  @Input() canEdit: boolean = false;
  @Input() canView: boolean = false;
  @Input() canDelete: boolean = false;
  @Input() addbtn:boolean=false;
  
  showAllSearchFields = false;

  @Output() tabChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<{ [key: string]: string }>();
  @Output() clear = new EventEmitter<void>();
  @Output() add=new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<{ row: any, value: boolean, status: string }>();
  @Output() pageChange = new EventEmitter<{ page: number, pageSize: number }>();
  @Output() call = new EventEmitter<any>();
  @Output() sort = new EventEmitter<{ column: string, direction: 'asc' | 'desc' }>();
  dateRange: { start: Date | null; end: Date | null }={ start: null, end: null };

  @Output() rangeSelected = new EventEmitter<{ start: Date; end: Date }>();

  statusKey = 'status';
  currentSortColumn: string = 'name';
  currentSortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    for (let field of this.searchFields) {
      this.searchValues[field.key] = '';
    }
    if (!this.totalRecords && this.total) {
      this.totalRecords = this.total;
    }
  }
  get upperFields() {
    return this.searchFields.slice(0, 3);  // First 3
  }
  onRangeChange(range: { start: Date; end: Date }) {
    this.rangeSelected.emit(range);
  }
  get lowerFields() {
    return this.searchFields.slice(3);     // Next 3
  }

  get selectedTabIndex(): number {
    return this.tabs.findIndex(tab => tab.value === this.activeTab);
  }
  isOptionObject(opt: string | SearchFieldOption): opt is SearchFieldOption {
    return !!opt && typeof opt === 'object' && 'value' in opt && 'label' in opt;
  }

  get displayedColumns(): string[] {
    return [...this.columns.map(col => col.key), 'actions'];
  }
  get visibleSearchFields() {
    if (!this.showAllSearchFields && this.searchFields.length > 3) {
      return this.searchFields.slice(0, 3);
    }
    return this.searchFields;
  }

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
  onSearch() {
    this.search.emit(this.searchValues);
  }
  onClear() {
    for (let key in this.searchValues) {
      this.searchValues[key] = '';
    }
    this.clear.emit();
  }
  onEdit(row: any) { this.edit.emit(row); }
  onAdd() { this.add.emit(); }
  onView(row: any) { this.view.emit(row); }
  onDelete(row: any) { this.delete.emit(row); }
  onCall(row: any) { this.call.emit(row); }
  // In your table component
  onToggle(row: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const status = checked ? 'ACTIVE' : 'INACTIVE';
    this.toggle.emit({ row, value: checked, status });
    (event.target as HTMLInputElement).checked = !checked;
  }
  onSort(col: any, direction: 'asc' | 'desc') {
  this.currentSortColumn = col.key;
  this.currentSortDirection = direction;

  this.data.sort((a, b) => {
    const valA = a[col.key];
    const valB = b[col.key];
    const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
    return direction === 'asc' ? comparison : -comparison;
  });
}
onColumnHeaderClick(col: any): void {
  if (!col.sortable) return;
  
  if (this.currentSortColumn === col.key) {
    this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.currentSortColumn = col.key;
    this.currentSortDirection = 'asc';
  }
  
  this.onSort(col, this.currentSortDirection);
}
  onMaterialPage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.page = 1; // Reset to first page on page size change!
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }
  get totalPages(): number {
    const total = this.totalRecords || this.total;
    return Math.max(Math.ceil(total / this.pageSize), 1);
  }
  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 1) return [];
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    return [1,2,3,4,5,6,7,8];
  }
  goToPage(pg: number) {
    if (typeof pg !== 'number') return;
    if (pg < 1 || pg > this.totalPages || pg === this.page || this.loading) return;
    this.page = pg;
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }
  getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? '';
  }
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }
  formatValue(value: any, column: TableColumn): any {
    if (!value && value !== 0) return '-';
    switch (column.type) {
      case 'status': return value;
      case 'date': return new Date(value);
      case 'currency': return parseFloat(value) || 0;
      default: return value;
    }
  }
  get hasActiveFilters(): boolean {
    return Object.values(this.searchValues).some(value => value && value.trim() !== '');
  }
  get currentPageInfo(): string {
    const total = this.totalRecords || this.total;
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, total);
    return `${start}-${end} of ${total}`;
  }
  Math = Math;
}