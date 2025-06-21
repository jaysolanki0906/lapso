import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ServicevoucherlistComponent } from './servicevoucherlist/servicevoucherlist.component';
import { CommonTableCardComponent } from '../../shared/common-table-card/common-table-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ServicevoucherformComponent } from './servicevoucherform/servicevoucherform.component';
import { ServicecallformComponent } from '../servicecall/servicecallform/servicecallform.component'; // Make sure this path is correct

const routes: Routes = [
  { path: '', component: ServicevoucherlistComponent },
  { path: 'add', component: ServicevoucherformComponent },
  { path: 'edit/:id', component: ServicevoucherformComponent },
  { path: 'view/:id', component: ServicevoucherformComponent },
];

@NgModule({
  declarations: [ServicevoucherlistComponent],
  imports: [
    CommonModule,
    CommonTableCardComponent,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    ServicecallformComponent, // <--- Standalone component
    HeaderComponent,
    ServicevoucherformComponent,
    RouterModule.forChild(routes),
  ],
  exports: [ServicevoucherlistComponent, RouterModule]
})
export class ServicevoucherModule { }