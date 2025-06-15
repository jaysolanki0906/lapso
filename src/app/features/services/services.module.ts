import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonTableCardComponent } from '../../shared/common-table-card/common-table-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { RouterModule, Routes } from '@angular/router';
import { ServicecalllistComponent } from '../servicecall/servicecalllist/servicecalllist.component';
import { ServicelistComponent } from './servicelist/servicelist.component';
import { ServiceformComponent } from './serviceform/serviceform.component';

const routes: Routes = [
  { path: '', component: ServicelistComponent },    
];

@NgModule({
  declarations: [ServicelistComponent],
  imports: [
    CommonModule,
    CommonTableCardComponent,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    HeaderComponent,
    ServiceformComponent,
    RouterModule.forChild(routes),
  ],
  exports:[ServicelistComponent,RouterModule]
})
export class ServicesModule { }
