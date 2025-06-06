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

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface TableTab {
  label: string;
  value: string;
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
    MatCardModule
  ],
})
export class CommonTableCardComponent implements OnInit {
  @Input() tabs: TableTab[] = [];
  @Input() activeTab: string = '';

  @Input() searchFields: { placeholder: string, key: string }[] = [];
  searchValues: { [key: string]: string } = {};

  @Input() columns: TableColumn[] = [];

  @Input() data: any[] = [];

  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() pageSize: number = 20;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];

  @Input() loading: boolean = false;

  @Output() tabChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<{ [key: string]: string }>();
  @Output() clear = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<{ row: any, value: boolean }>();
  @Output() pageChange = new EventEmitter<{ page: number, pageSize: number }>();

  ngOnInit() {
    for (let field of this.searchFields) {
      this.searchValues[field.key] = '';
    }
  }

  // For mat-tab-group [selectedIndex]
  get selectedTabIndex(): number {
    return this.tabs.findIndex(tab => tab.value === this.activeTab);
  }

  // For mat-table columns
  get displayedColumns(): string[] {
    return [...this.columns.map(col => col.key), 'actions'];
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
    for (let key in this.searchValues) this.searchValues[key] = '';
    this.clear.emit();
  }

  onEdit(row: any) { this.edit.emit(row); }
  onView(row: any) { this.view.emit(row); }
  onDelete(row: any) { this.delete.emit(row); }

  onToggle(row: any, event: any) {
    this.toggle.emit({ row, value: event.checked });
  }

  onMaterialPage(event: PageEvent) {
    // MatPaginator starts pageIndex at 0
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
    return Math.max(Math.ceil(this.total / this.pageSize), 1);
  }

  get pageNumbers(): number[] {
    // Show up to 5 page numbers centered around the current page
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
    if (pg < 1 || pg > this.totalPages || pg === this.page) return;
    this.page = pg;
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }
}