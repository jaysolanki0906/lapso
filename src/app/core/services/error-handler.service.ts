import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor() {}

  public showError(error: any,icon: 'success' | 'error' | 'info' | 'warning'): void {
    let message = 'An unexpected error occurred';
    if (typeof error === 'string') {
      message = error;
    } else if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    // Display error using SweetAlert2
    Swal.fire({
      icon: icon,
      title: 'Oops...',
      text: message
    });
  }
  public showToast(error: any, icon: 'success' | 'error' | 'info' | 'warning') {
    let message = 'An unexpected error occurred';
    if (typeof error === 'string') {
      message = error;
    } else if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
}
public confirmSwal(
  title: string,
  message: string,
  name: string,
  confirmButtonText: string = 'Yes, delete user',
  confirmButtonColor: string = '#ef4444'
): Promise<boolean> {
  return Swal.fire({
    title: title,
    html: `<div style="display: flex; flex-direction: column; gap: 8px;">
             <div>${message} <strong>${name}</strong>?</div>
             <center><small class="text-muted">⚠️ This action cannot be undone.</small></center>
           </div>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: confirmButtonColor,
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
    width: 600,
    customClass: {
      popup: 'swal-horizontal-layout'
    }
  }).then((result) => {
    return !!result.isConfirmed;
  });
}
}