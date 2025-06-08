import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenService } from './core/services/token.service';
import { UserService } from './core/services/user.service';
import { LoaderService } from './core/services/loader.service';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { OrganizationService } from './core/services/organization.service';
import { HeaderComponent } from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HttpClientModule,CommonModule,AsyncPipe,HeaderComponent,SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private userService: UserService,private organizationService:OrganizationService, private token: TokenService,public loaderService: LoaderService) {}

  ngOnInit() {
    if (this.token.getAccessToken()) {
      this.userService.fetchAndStoreProfile().subscribe();
      this.organizationService.fetchAndStoreOrganization().subscribe();
    }
  }
}