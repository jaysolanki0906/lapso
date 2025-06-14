import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiServiceService } from './api-service.service';

@Injectable({
  providedIn: 'root'
})
export class OrgusersService {

  constructor(private api:ApiServiceService) { }
  fetchusers(orgid:string,params: {
          search?: string}):Observable<any>{
             const query: string[] = [];
     if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
     const queryString = query.length ? `?${query.join('&')}` : '';
    return this.api.get(`organization/${orgid}/users${queryString}`);
  }
  fetchroles(orgid:string):Observable<any>
  {
    return this.api.get(`${orgid}/org-roles/role-option`);
  }
  saveuser(orgid:string,paylod:any):Observable<any>
  {
    return this.api.post(`organization/${orgid}/users`,paylod);
  }
  edituser(orgid:string,id:string,paylod:any):Observable<any>
  {
    return this.api.put(`organization/${orgid}/users/${id}`,paylod);
  }
  deleteuser(orgid:string,id:string):Observable<any>
  {
    return this.api.delete(`organization/${orgid}/users/${id}`)
  }
  resendemail(payload: { request_id: string }): Observable<any> {
  return this.api.post(`auth/resend-email`, payload);
  }
  
}
