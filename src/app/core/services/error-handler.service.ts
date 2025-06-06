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
}