import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { CommonTableCardComponent } from './common-table-card/common-table-card.component';
import { NotfoundcomponentComponent } from './notfoundcomponent/notfoundcomponent.component';
import { ProfileComponent } from './profile/profile.component';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../features/dashboard/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [ChangePasswordDialogComponent,
    CommonTableCardComponent,
    HeaderComponent,
    SidebarComponent,
    NotfoundcomponentComponent,
  ProfileComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[]
})
export class SharedModule { }
