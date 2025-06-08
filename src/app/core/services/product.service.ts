import { Injectable } from '@angular/core';
import { ApiServiceService } from './api-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private api:ApiServiceService) { }
  fetchcategory():Observable<any[]> {
    return this.api.get('master/products');
  }
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
    return this.api.get(`${org_id}/items${queryString}`);
  }
  addproduct(org_id:string,paylod:any):Observable<any> {
    return this.api.post(`${org_id}/items`, paylod);
  }
  updateProduct(orgId: string, id: number | string, payload: any): Observable<any> {
    return this.api.put(`${orgId}/items/${id}`, payload);
  }
  deleteProduct(orgId: string, id: number | string) {
  return this.api.delete(`${orgId}/items/${id}`);
}
}
