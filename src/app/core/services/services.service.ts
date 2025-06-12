import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiServiceService } from './api-service.service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

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
      return this.api.get(`${org_id}/services${queryString}`);
    }
    addservice(org_id:string,paylod:any):Observable<string>
    {
      return this.api.post(`${org_id}/services`,paylod);
    }
    updateservice(org_id:string,id:string,paylod:any):Observable<string>
    {
      return this.api.put(`${org_id}/services/${id}`,paylod);
    }
    getService(org_id: string, service_id: string): Observable<any> {
  return this.api.get(`${org_id}/services/${service_id}`);
}
  deleteService(org_id: string, service_id: string): Observable<any> {
  return this.api.delete(`${org_id}/services/${service_id}`);
}
}
