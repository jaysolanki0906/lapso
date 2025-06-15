import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
;
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';import { rolebaseGuard } from '../../core/guards/rolebased.guard';
import { TableComponent } from '../sales/table/table.component';
import { SalesFormComponent } from '../sales/sales-form/sales-form.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { CommonTableCardComponent } from '../../shared/common-table-card/common-table-card.component';
import { ProductsSendComponent } from './products-send/products-send.component';
import { FormComponent } from './form/form.component';
;

const routes: Routes = [
    {path: '',component:ProductsSendComponent}
];

@NgModule({
  declarations: [ProductsSendComponent],
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    MatButtonModule,
    MatIconModule,
    CommonTableCardComponent,
    FormComponent,
    RouterModule.forChild(routes)
  ],
  exports: [ProductsSendComponent]
})
export class VoucherModule { }