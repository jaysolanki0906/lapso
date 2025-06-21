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
          order_type?: string,
          servicetype?:string,
          Assigned?:string[],
          Service_date_start?:string,
          service_date_end?:string
  //         Service_type:string='';
  // Status:string="";
  // Assigned:string='';
  // Service_date_start='';
  // Service_date_end='';
        } = {}
      ): Observable<any> {
        const query: string[] = [];
        if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
        if (params.offset !== undefined) query.push(`offset=${params.offset}`);
        if (params.limit !== undefined) query.push(`limit=${params.limit}`);
        if (params.status) query.push(`status=${params.status}`);
        if (params.order_by) query.push(`order_by=${params.order_by}`);
        if (params.order_type) query.push(`order_type=${params.order_type}`);
        if(params.servicetype) query.push(`service_type=${params.servicetype}`);
        if(params.Service_date_start) query.push(`start_date=${params.Service_date_start}`);
        if(params.service_date_end) query.push(`end_date=${params.service_date_end}`);
        if(params.servicetype||params.status||params.service_date_end||params.Service_date_start||params.Assigned)
        query.push('type=ALL');

        if (params.Assigned && params.Assigned.length > 0) {
    for (const userId of params.Assigned) {
      if (userId) { 
        query.push(`user_ids=${encodeURIComponent(userId)}`);
      }
    }
  }
  if(!params.order_by)
      {
        query.push("order_by=created_at&order_type=desc");
      }
        query.push('count_required=true');
    
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
  addattachment(formData: FormData): Observable<any> {
  return this.api.post('attachment', formData);
}
  saveaction(orgid:string,vid:string,cid:string,paylod:any):Observable<any>
  {
    return this.api.post(`${orgid}/service_voucher/${vid}/service_calls/${cid}/actions`,paylod);
  }
  getcall(
    orgid: string,
    vid: string,
    params?: {
      search?: string;
      status?: string;
      servicetype?: string;
      assigned?: string[]; // or string if only one allowed
      offset?: number;
      limit?: number;
      order_by?: string;
      order_type?: string;
      Service_date_start?: string;
      service_date_end?: string;
    }
  ): Observable<any> {
    const query: string[] = [];
    if (params?.search) query.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.offset !== undefined) query.push(`offset=${params.offset}`);
    if (params?.limit !== undefined) query.push(`limit=${params.limit}`);
    if (params?.status) query.push(`status=${params.status}`);
    if (params?.order_by) query.push(`order_by=${params.order_by}`);
    if (params?.order_type) query.push(`order_type=${params.order_type}`);
    if (params?.servicetype) query.push(`service_type=${params.servicetype}`);
    if (params?.assigned && Array.isArray(params.assigned) && params.assigned.length > 0) {
      query.push(`user_ids=${params.assigned.join(',')}`);
    }
    if (
      params?.servicetype ||
      params?.status ||
      params?.service_date_end ||
      params?.Service_date_start ||
      (params?.assigned && params.assigned.length > 0)
    ) {
      query.push('type=ALL');
    }
    const queryString = query.length ? `?${query.join('&')}` : '';

    return this.api.get(`${orgid}/service_voucher/${vid}/service_calls${queryString}`);
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
