import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiServiceService } from './api-service.service';
import { TokenService } from './token.service';
import { throwError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';


@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private api:ApiServiceService,private tokenService:TokenService,private error:ErrorHandlerService) { }
  private REFRESH_URL ="auth/token/refresh";

  Login(payload: any): Observable<any> {
    return this.api.post<any>("auth/login", payload);
  }
  refreshToken(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => this.error.showError('No refresh token found','error'));
    }
    return this.api.post<any>(this.REFRESH_URL, { refresh_token: refreshToken });
  }
  requestotppayload(payload: any): Observable<any> {
    return this.api.post<any>("auth/otp/request", payload);
  }
  otpcheck(payload: any): Observable<any> {
    return this.api.post<any>("auth/otp/check", payload);
  }
  authregisterorgnisation(payload: any): Observable<any> {
    return this.api.post<any>("auth/register/organization", payload);
  }
  changepassword(payload: any): Observable<any> {
    return this.api.put<any>("auth/change_password", payload);
  }
  logout(): void {
  this.tokenService.clearTokens();
}
}
