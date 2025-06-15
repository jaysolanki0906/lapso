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

const routes: Routes = [
  { path: '', component: ServicevoucherlistComponent },    
];

@NgModule({
  declarations: [ServicevoucherlistComponent],
  imports: [
    CommonModule,
    CommonTableCardComponent,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    HeaderComponent,
    ServicevoucherformComponent,
    RouterModule.forChild(routes),
  ],
  exports:[ServicevoucherlistComponent,RouterModule]
})
export class ServicevoucherModule { }
