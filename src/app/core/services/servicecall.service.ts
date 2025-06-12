import { Injectable } from '@angular/core';
import { ApiServiceService } from './api-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicecallService {

  constructor(private api:ApiServiceService) { }
  getItems(
        org_id: string,
        params: {
          search?: string,
          offset?: number,
          limit?: number,
          status?: string,
          order_by?: string,
          order_type?: string
        } = {}
      ): Observable<any> {
        const query: string[] = [];
        if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
        if (params.offset !== undefined) query.push(`offset=${params.offset}`);
        if (params.limit !== undefined) query.push(`limit=${params.limit}`);
        if (params.status) query.push(`status=${params.status}`);
        if (params.order_by) query.push(`order_by=${params.order_by}`);
        if (params.order_type) query.push(`order_type=${params.order_type}`);
    
        const queryString = query.length ? `?${query.join('&')}` : '';
        return this.api.get(`${org_id}/service_voucher/service_calls${queryString}`);
      }
  getservicevoucher(orgid:string, params: {
          search?: string}):Observable<string>{
     const query: string[] = [];
     if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
     const queryString = query.length ? `?${query.join('&')}` : '';
    return this.api.get(`${orgid}/service_voucher${queryString}`);
  }
  getusers(orgid:string):Observable<any>{
    return this.api.get(`${orgid}/service_voucher/users`);
  }
  schedulecall(orgid:string,vid:string,paylod:any):Observable<any>
  {
    return this.api.post(`${orgid}/service_voucher/${vid}/service_calls`,paylod);
  }
  editcall(orgid:string,vid:string,paylod:any,id:string):Observable<any>
  {
    return this.api.put(`${orgid}/service_voucher/${vid}/service_calls/${id}`,paylod);
  }
  
  fetchcall(orgid:string,vid:string,id:string):Observable<any>
  {
    return this.api.get(`${orgid}/service_voucher/${vid}/service_calls/${id}`);
  }
  deletecall(orgid:string,vid:string,id:string):Observable<any>
  {
    return this.api.delete(`${orgid}/service_voucher/${vid}/service_calls/${id}`);
  }
}
