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

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [rolebaseGuard,authGuard],
  },
  { path: 'profile', component: ProfileComponent,canActivate: [rolebaseGuard,authGuard],},
  { path: 'items',loadChildren: () =>
      import('./features/product/product.module').then(
        (m) => m.VoucherModule
      ),canActivate: [rolebaseGuard,authGuard],
  },
  {
  path: 'voucher',
  loadChildren: () => import('./features/sales/sales.module').then(m => m.SalesModule),
  canActivate: [rolebaseGuard,authGuard],
},
  {
  path: '',
  loadChildren: () => import('./features/sales/sales.module').then(m => m.SalesModule),
  canActivate: [rolebaseGuard,authGuard],
},
{
  path:'servicecall',
  loadChildren: () => import('./features/servicecall/servicecall.module').then(m => m.ServicecallModule),
  canActivate: [rolebaseGuard,authGuard],
},
{
  path:'service',
  loadChildren: () => import('./features/services/services.module').then(m => m.ServicesModule),
  canActivate: [rolebaseGuard,authGuard],
},
{
  path:'vouchers',
  loadChildren: () => import('./features/servicevoucher/servicevoucher.module').then(m => m.ServicevoucherModule),
  canActivate: [rolebaseGuard,authGuard],
},
{
  path:'settings',
    children:[
      {path:'user-management',component:UsermanagementComponent},
      {path:'role-permission-management',component:RolesandpermissionComponent},
    ],
    canActivate: [rolebaseGuard,authGuard],
  },
  { path: 'not-authorized', component: NotAuthorizedComponent},
  { path: '**', component: NotfoundcomponentComponent },
];
