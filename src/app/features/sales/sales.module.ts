import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonTableCardComponent } from '../../shared/common-table-card/common-table-card.component';

const routes: Routes = [
  { path: 'sales-vouchers', component: TableComponent },
  // { path: 'add', component: FormComponent }, 
];

@NgModule({
  declarations: [TableComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    CommonModule,
    HeaderComponent, 
    SidebarComponent, 
    MatIconModule, 
    ReactiveFormsModule, 
    CommonTableCardComponent,

  ]
})
export class SalesModule { }
