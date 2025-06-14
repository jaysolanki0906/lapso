import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-authorized',
  template: `
    <div class="not-authorized-container">
      <h1>Not Authorized</h1>
      <p>You do not have permission to access this page.</p>
      <button (click)="goHome()">Go to Home</button>
    </div>
  `,
  styles: [`
    .not-authorized-container {
      text-align: center;
      margin-top: 100px;
    }
    .not-authorized-container h1 {
      color: #d32f2f;
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    .not-authorized-container p {
      margin-bottom: 30px;
      color: #555;
      font-size: 1.2rem;
    }
    .not-authorized-container button {
      background: #1976d2;
      color: #fff;
      border: none;
      padding: 12px 32px;
      font-size: 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .not-authorized-container button:hover {
      background: #1565c0;
    }
  `]
})
export class NotAuthorizedComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}