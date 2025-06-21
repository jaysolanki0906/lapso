import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-notfoundcomponent',
  imports: [],
  templateUrl: './notfoundcomponent.component.html',
  styleUrl: './notfoundcomponent.component.scss'
})
export class NotfoundcomponentComponent {
 constructor(private router: Router) {}
  redirectfunction()
  {
    let token:string|null="this is nothing";
    token=localStorage.getItem('access_token');
    console.log(token);
    if(token)
    {
      this.router.navigate(['dashboard']);
    }
    else{
      this.router.navigate(['login']);
    }
  }
}
