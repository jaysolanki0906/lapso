import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserService } from '../../core/services/user.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{
  profileForm: FormGroup;

  constructor(private fb: FormBuilder,private userService: UserService,private error:ErrorHandlerService) {
    this.profileForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      country_code: ['+91', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
    });
  }
   ngOnInit() {
    this.userService.userProfile$.subscribe(profile => {
      if (profile) {
        console.log('Profile data:', profile);
        this.profileForm.patchValue({
          fullname: profile.fullname,
          email: profile.email,
          country_code: profile.country_code,
          mobile: profile.mobile,
        });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.userService.editinfo(this.profileForm.value).subscribe({
        next: (response:any) => {
          console.log('Profile updated successfully:', response);
          this.error.showToast('Profile updated successfully', 'success');
        },
        error: (error:any) => {
          this.error.showError(error,'error');
        }
      });
    }
  }
}