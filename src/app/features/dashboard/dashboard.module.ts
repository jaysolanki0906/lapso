import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from '../../shared/header/header.component';    // standalone
import { SidebarComponent } from '../../shared/sidebar/sidebar.component'; // standalone

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [DashboardComponent], // Classic (non-standalone) component only!
  imports: [
    CommonModule,
    HeaderComponent,    
    SidebarComponent,   
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardModule { }