import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenService } from './core/services/token.service';
import { UserService } from './core/services/user.service';
import { LoaderService } from './core/services/loader.service';
import { OrganizationService } from './core/services/organization.service';
import { CommonModule, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private userService: UserService,
    private token: TokenService,
    public loaderService: LoaderService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    if (this.token.getAccessToken()) {
      this.userService.fetchAndStoreProfile().subscribe(profile => {
        if (profile) {
          this.organizationService.fetchAndStoreOrganization().subscribe();
        }
      });
    }
  }
}