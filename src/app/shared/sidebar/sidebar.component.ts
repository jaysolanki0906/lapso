import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { version } from '../../../../package.json'; // Adjust path if needed
import { RolePermissionService } from '../../core/services/role-permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [MatIconModule, MatButtonModule, HttpClientModule,CommonModule],
  standalone: true
})
export class SidebarComponent implements OnInit {
  serviceContractExpanded = true;
  appVersion:string= '';

  canViewDashboard = false;
  canViewProducts = false;
  canViewSalesVouchers = false;
  canViewServices = false;
  canViewServiceVouchers = false;
  canViewServiceCalls = false;

  get canViewServiceContractDropdown(): boolean {
    return this.canViewServices || this.canViewServiceVouchers || this.canViewServiceCalls;
  }

  constructor(
    private router: Router,
    private rolePermissionService: RolePermissionService,
    private http: HttpClient
  ) {}


  ngOnInit() {
    this.appVersion=version;

    this.canViewDashboard = true;
    this.canViewProducts = this.rolePermissionService.getPermission('product');
    this.canViewSalesVouchers = this.rolePermissionService.getPermission('sales_voucher');
    this.canViewServices = this.rolePermissionService.getPermission('services');
    this.canViewServiceVouchers = this.rolePermissionService.getPermission('service_voucher');
    this.canViewServiceCalls = this.rolePermissionService.getPermission('service_call');
  }

  toggleServiceContract() {
    this.serviceContractExpanded = !this.serviceContractExpanded;
  }

  dashboardredirection() {
    this.router.navigate(['dashboard']);
  }
  productredirection() {
    this.router.navigate(['items']);
  }
  saleredirection() {
    this.router.navigate(['voucher/invoice']);
  }
  redirectservice() {
    this.router.navigate(['service']);
  }
  redirectservicevoucher() {
    this.router.navigate(['vouchers']);
  }
  redirectservicecalls() {
    this.router.navigate(['servicecall']);
  }
}