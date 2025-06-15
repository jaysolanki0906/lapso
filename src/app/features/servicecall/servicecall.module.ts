import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ServicecallformComponent } from './servicecallform/servicecallform.component';
import { ServicecalllistComponent } from './servicecalllist/servicecalllist.component';
import { CommonTableCardComponent } from '../../shared/common-table-card/common-table-card.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

const routes: Routes = [
  { path: '', component: ServicecalllistComponent },    
];

@NgModule({
  declarations: [ServicecalllistComponent,],
  imports: [
    CommonModule,
    CommonTableCardComponent,
    HeaderComponent, 
    ServicecallformComponent,
    MatIconModule, 
    SidebarComponent,
    RouterModule.forChild(routes),
  ],
  exports: [ServicecalllistComponent]
})
export class ServicecallModule { }