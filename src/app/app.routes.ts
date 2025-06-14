import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { NotfoundcomponentComponent } from './shared/notfoundcomponent/notfoundcomponent.component';
import { ProductsSendComponent } from './features/product/products-send/products-send.component';
import { TableComponent } from './features/sales/table/table.component';
import { SalesFormComponent } from './features/sales/sales-form/sales-form.component';
import { ServicelistComponent } from './features/services/servicelist/servicelist.component';
import { ServiceformComponent } from './features/services/serviceform/serviceform.component';
import { ServicevoucherlistComponent } from './features/servicevoucher/servicevoucherlist/servicevoucherlist.component';
import { ServicevoucherformComponent } from './features/servicevoucher/servicevoucherform/servicevoucherform.component';
import { ServicecalllistComponent } from './features/servicecall/servicecalllist/servicecalllist.component';
import { UsermanagementComponent } from './features/settings/user/usermanagement/usermanagement.component';
import { RolesandpermissionComponent } from './features/settings/roles-permission/rolesandpermission/rolesandpermission.component';
import { NotAuthorizedComponent } from './features/notauthorised/notauthorised.component';
import { rolebaseGuard } from './core/guards/rolebased.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent,canActivate: [rolebaseGuard] },
  { path: 'profile', component: ProfileComponent,canActivate: [rolebaseGuard]},
  { path: 'products', component: ProductsSendComponent,canActivate: [rolebaseGuard], },
  {
    path: 'sales',
    children: [
      { path: '', component: TableComponent,canActivate: [rolebaseGuard], }, // /sales
      { path: 'add', component: SalesFormComponent,canActivate: [rolebaseGuard], }, // /sales/add
      { path: 'edit/:voucherId', component: SalesFormComponent ,canActivate: [rolebaseGuard],}, // /sales/edit/123
    ]
  },
  {
    path:'service',
    children:[
      { path: '', component: ServicelistComponent,canActivate: [rolebaseGuard] },
      { path: 'add', component: ServiceformComponent,canActivate:[rolebaseGuard]}, 
      { path: 'edit/:id', component: ServiceformComponent,canActivate: [rolebaseGuard] }, 
    ]
  },
  {
    path:'servicevoucher',
    children:[
      {path:'',component:ServicevoucherlistComponent,canActivate: [rolebaseGuard]},
      {path:'add',component:ServicevoucherformComponent,canActivate: [rolebaseGuard]},
      {path:'edit/:id',component:ServicevoucherformComponent,canActivate: [rolebaseGuard]},
      {path:'view/:id',component:ServicevoucherformComponent,canActivate: [rolebaseGuard]},
    ]
  },
  {path:'servicecall',component:ServicecalllistComponent,canActivate: [rolebaseGuard]},
  {path:'settings',
    children:[
      {path:'user-management',component:UsermanagementComponent,canActivate: [rolebaseGuard]},
      {path:'role-permission-management',component:RolesandpermissionComponent,canActivate: [rolebaseGuard]},
    ]
  },
  { path: 'not-authorized', component: NotAuthorizedComponent},
  { path: '**', component: NotfoundcomponentComponent },
];
