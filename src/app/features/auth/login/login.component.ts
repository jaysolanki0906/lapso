import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '../../../core/services/auth-service.service';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { TokenService } from '../../../core/services/token.service';
import { UserService } from '../../../core/services/user.service';
import { RolePermissionService } from '../../../core/services/role-permission.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  userSelectedType = "PWD";
  submitted = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    public auth: AuthServiceService,
    private err: ErrorHandlerService,
    private router: Router,
    private token: TokenService,
    private userService: UserService, // <-- Add UserService injection,
    private rolePermissionService:RolePermissionService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const loginPayload = {
        type: "PWD", 
        otp_token: '',
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.auth.Login(loginPayload).subscribe({
  next: (response) => {
    this.token.saveTokens(response.access_token, response.refresh_token);
    this.userService.fetchAndStoreProfile().subscribe({
      next: (profile) => {
        // Set role and permissions BEFORE navigating
        this.rolePermissionService.setRole(profile.role, profile.auth_items);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.err.showError('Failed to load profile', 'error')
    });
  },
  error: (error) => this.err.showError(error, 'error')
});
    }
  }
}