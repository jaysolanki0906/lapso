import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { NotfoundcomponentComponent } from './shared/notfoundcomponent/notfoundcomponent.component';
import { CommonTableCardComponent } from './shared/common-table-card/common-table-card.component';
import { ProductsSendComponent } from './features/product/products-send/products-send.component';
import { TableComponent } from './features/sales/table/table.component';
import { SalesFormComponent  } from './features/sales/sales-form/sales-form.component';

export const routes: Routes = [
     { path: 'register', component: RegisterComponent },
     { path: 'login', component: LoginComponent },
     { path: 'dashboard',component:DashboardComponent },
     { path: 'profile',component:ProfileComponent },
     { path: 'products',component:ProductsSendComponent },
     { path: 'sales',component:TableComponent },
     { path: 'add',component:SalesFormComponent },
     { path: 'edit',component:SalesFormComponent },
     { path: '**',component:NotfoundcomponentComponent },
];
