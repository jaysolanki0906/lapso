import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { NotfoundcomponentComponent } from './shared/notfoundcomponent/notfoundcomponent.component';
import { UsermanagementComponent } from './features/settings/user/usermanagement/usermanagement.component';
import { RolesandpermissionComponent } from './features/settings/roles-permission/rolesandpermission/rolesandpermission.component';
import { NotAuthorizedComponent } from './features/notauthorised/notauthorised.component';
import { rolebaseGuard } from './core/guards/rolebased.guard';
import { authGuard } from './core/guards/auth.guard';
import { ServiceformComponent } from './features/services/serviceform/serviceform.component';
import { ServicevoucherformComponent } from './features/servicevoucher/servicevoucherform/servicevoucherform.component';
import { HomeGuard } from './core/guards/home.guard';
import { loginGuard } from './core/guards/login.guard';
import { SalesFormComponent } from './features/sales/sales-form/sales-form.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent,canActivate:[loginGuard]},
  { path: 'voucher/invoice/add', component: SalesFormComponent }, 
  { path: 'voucher/invoice/edit/:voucherId', component: SalesFormComponent }, 

  {
    path: '',
    pathMatch: 'full',
    redirectTo: localStorage.getItem('access_token') ? 'dashboard' : 'login'
  },
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [HomeGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [rolebaseGuard, authGuard,HomeGuard], 
  },
  {
    path: 'items',
    loadChildren: () =>
      import('./features/product/product.module').then(
        (m) => m.VoucherModule
      ),
    canActivate: [rolebaseGuard, authGuard,HomeGuard],
  },
  {
    path: 'voucher',
    loadChildren: () => import('./features/sales/sales.module').then(m => m.SalesModule),
    canActivate: [rolebaseGuard, authGuard,HomeGuard],
  },
  {
    path: 'servicecall',
    loadChildren: () => import('./features/servicecall/servicecall.module').then(m => m.ServicecallModule),
    canActivate: [rolebaseGuard, authGuard,HomeGuard],
  },
  {
    path: 'service',
    loadChildren: () => import('./features/services/services.module').then(m => m.ServicesModule),
    canActivate: [rolebaseGuard, authGuard,HomeGuard],
  },
  {
    path: 'vouchers',
    loadChildren: () => import('./features/servicevoucher/servicevoucher.module').then(m => m.ServicevoucherModule),
    canActivate: [rolebaseGuard, authGuard,HomeGuard],
  },
  {
    path: 'settings',
    children: [
      { path: 'user-management', component: UsermanagementComponent },
      { path: 'role-permission-management', component: RolesandpermissionComponent },
    ],
    canActivate: [rolebaseGuard, authGuard,HomeGuard],
  },
  { path: 'not-authorized', component: NotAuthorizedComponent },
  { path: '**', component: NotfoundcomponentComponent },
];
