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

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'products', component: ProductsSendComponent },
  {
    path: 'sales',
    children: [
      { path: '', component: TableComponent }, // /sales
      { path: 'add', component: SalesFormComponent }, // /sales/add
      { path: 'edit/:voucherId', component: SalesFormComponent }, // /sales/edit/123
    ]
  },
  {
    path:'service',
    children:[
      { path: '', component: ServicelistComponent },
      { path: 'add', component: ServiceformComponent }, 
      { path: 'edit/:id', component: ServiceformComponent }, 
    ]
  },
  {
    path:'servicevoucher',
    children:[
      {path:'',component:ServicevoucherlistComponent},
      {path:'add',component:ServicevoucherformComponent},
      {path:'edit/:id',component:ServicevoucherformComponent},
      {path:'view/:id',component:ServicevoucherformComponent},
    ]
  },
  {path:'servicecall',component:ServicecalllistComponent},
  { path: '**', component: NotfoundcomponentComponent },
];
