import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';
import { AuthServiceService } from '../../core/services/auth-service.service';
import { Router } from '@angular/router';
import { UserService, UserProfile } from '../../core/services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [MatIconModule, CommonModule],
  standalone: true
})
export class HeaderComponent {
  menuOpen = false;
  userProfile$: Observable<UserProfile | null>;

  constructor(
    private dialog: MatDialog,
    private auth: AuthServiceService,
    private router: Router,
    private userService: UserService,
  ) {
     this.userProfile$ = this.userService.userProfile$; 
    if (!this.userService.userProfile) {
      this.userService.fetchAndStoreProfile().subscribe();
    }
  }

  openChangePassword() {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '540px',
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}