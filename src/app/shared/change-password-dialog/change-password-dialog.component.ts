import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthServiceService } from '../../core/services/auth-service.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule]
})
export class ChangePasswordDialogComponent {
  form: FormGroup;
  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthServiceService,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private errorHandler: ErrorHandlerService
  ) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
        ]
      ],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { notMatching: true };
  }

  close() {
    this.dialogRef.close();
  }

  changePassword() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    const paylod={
      "current_password": this.form.get('currentPassword')?.value,
      "new_password": this.form.get('newPassword')?.value,
    };
    this.auth.changepassword(paylod).subscribe({
      next: (response) => {
        this.loading = false;
        this.dialogRef.close(true); 
        this.errorHandler.showToast('Password changed successfully', 'success');
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = error?.message || 'Change password failed. Please try again.';
        this.errorHandler.showToast(error, 'error');
      }
    });
  }
}