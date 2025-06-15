import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { SalesFormComponent } from './sales-form/sales-form.component';
import { rolebaseGuard } from '../../core/guards/rolebased.guard';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CommonTableCardComponent } from '../../shared/common-table-card/common-table-card.component';
import { FormComponent } from '../product/form/form.component';

const routes: Routes = [
  {
    path: 'invoice',
    children: [
      { path: '', component: TableComponent }, // /voucher/invoice
      { path: 'add', component: SalesFormComponent }, // /voucher/invoice/add
      { path: 'edit/:voucherId', component: SalesFormComponent }, // /voucher/invoice/edit/123
    ]
  }
];

@NgModule({
  declarations: [TableComponent, SalesFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),   
    HeaderComponent, 
    SidebarComponent, 
    MatIconModule, 
    ReactiveFormsModule, 
    CommonTableCardComponent,
    FormComponent
  ],
  exports: [TableComponent, SalesFormComponent]
})
export class SalesModule { }