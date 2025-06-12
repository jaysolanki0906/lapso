import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports:[MatIconModule, MatButtonModule, CommonModule],
  standalone: true
})
export class SidebarComponent {
  serviceContractExpanded = false;

  constructor(private router: Router) { }

  toggleServiceContract() {
    this.serviceContractExpanded = !this.serviceContractExpanded;
  }
  dashboardredirection(){
    this.router.navigate(['dashboard']);
  }
  productredirection(){
    this.router.navigate(['products']);
  }
  saleredirection(){
    this.router.navigate(['sales']);
  }
  redirectservice(){
    this.router.navigate(['service']);
  }
  redirectservicevoucher()
  {
    this.router.navigate(['servicevoucher']);
  }
  redirectservicecalls(){
    this.router.navigate(['servicecall']);
  }
}