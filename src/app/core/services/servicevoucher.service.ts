import { Injectable } from '@angular/core';
import { ApiServiceService } from './api-service.service';
import { Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root'
})
export class ServicevoucherService {

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
      return this.api.get(`${org_id}/service_voucher${queryString}`);
    }
    getvouchernumber(orgid:string):Observable<string>
    {
      return this.api.get(`${orgid}/service_voucher/voucher_number`);
    }
    customername(orgid:string,search:string):Observable<string>{
      return this.api.get(`${orgid}/contacts?search=${search}`);
    }
    fetchproduct(orgid:string):Observable<any>{
      return this.api.get(`${orgid}/items/filter`);
    }
    fetchservice(orgid:string):Observable<any>
    {
      return this.api.get(`${orgid}/services?status=ACTIVE`);
    }
    addservice(orgid:string,paylod:any):Observable<any>
    {
      return this.api.post(`${orgid}/service_voucher`,paylod);
    }
    editservice(orgid:string,id:string):Observable<any>
    {
      return this.api.get(`${orgid}/service_voucher/${id}`);
    }
    editrequest(orgid:string,id:string,paylod:any):Observable<any>
    {
      return this.api.put(`${orgid}/service_voucher/${id}`,paylod);
    }
    deleterequest(orgid:string,id:string):Observable<any>
    {
      return this.api.delete(`${orgid}/service_voucher/${id}`);
    }
}
