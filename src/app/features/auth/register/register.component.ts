import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AuthServiceService } from '../../../core/services/auth-service.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { from, lastValueFrom } from 'rxjs';
import { showOtpVerifySwal } from '../../../shared/otp-verify.swal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    RouterModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  selectedFile: File | null = null;
  submitted = false; 
  req_id = '';
  requestpaylod = false;
  otp = '';
  otpvarified = false;
  verificationtoken = '';
  registersucessfull:boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthServiceService,
    private err: ErrorHandlerService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      companyName: ['', Validators.required],
      fullName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      businessType: ['RETAILER'],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { passwordMismatch: true };
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length) {
      this.selectedFile = fileInput.files[0];
    }
  }

 async onSubmit() {
  this.submitted = true; 
  if (this.registerForm.valid) {
    const formData = { ...this.registerForm.value };
    const requestPayload = { duplicate_check: true, email: formData.email, type: "EMAIL" };

    try {
      const response = await lastValueFrom(this.auth.requestotppayload(requestPayload));
      if (!response.request_id || typeof response.request_id !== 'string' ) {
        throw this.err.showError('Invalid request_id returned from OTP request.','info');
      }
      this.req_id = response.request_id;
      this.requestpaylod = true;

      const otp = await showOtpVerifySwal(formData.email, 296);
      if (!otp) return; 
      const otpRes = await lastValueFrom(
        this.auth.otpcheck({ otp: otp, request_id: this.req_id })
      );
      if (!otpRes.verification_token) {
        throw this.err.showError('OTP verification failed: no token returned.','error');
      }
      this.otpvarified = true;
      this.verificationtoken = otpRes.verification_token;

      // FIXED: property name here
      const registerPayload = {
        company_name: formData.companyName,
        fullname: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        country_code: '+91', 
        password: formData.password,
        org_type: formData.businessType,
        verification_token: this.verificationtoken // <-- fixed
      };
      const registerRes = await lastValueFrom(
        this.auth.authregisterorgnisation(registerPayload)
      );
      this.registersucessfull = true;

    } catch (err) {
      this.err.showError(err,'error');
    }
  }
  if(this.registersucessfull)
  {
    const loginPayload = {
        type: "PWD", 
        otp_token: '',
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.auth.Login(loginPayload).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.err.showError(error,'error');
        }
      });
  }
}
}