import { Injectable } from '@angular/core';
import { ApiServiceService } from './api-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private api:ApiServiceService) { }
  getdata(org_id: string, page = 1, limit = 20, filters?: any): Observable<any> {
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const offset = (page - 1) * limit;
  let query = `offset=${offset}&limit=${limit}`;

  query += `&order_by=created_at&order_type=desc&voucher_type=INVOICE&count_required=true`;

  if (filters) {
    if (filters.invoice_number) query += `&invoice_number=${encodeURIComponent(filters.invoice_number)}`;
    if (filters.mobile) query += `&mobile=${encodeURIComponent(filters.mobile)}`;
  }

  console.log('API URL:', `${org_id}/vouchers?${query}`);
  return this.api.get(`${org_id}/vouchers?${query}`);
}
  assigninvoicenumber(org_id: string, type:string='INVOICE'): Observable<any> {
  return this.api.get(`${org_id}/vouchers/voucher_number/${type}`);
}
  filtertostoreproduct(org_id:string): Observable<any> {
  return this.api.get(`${org_id}/items/filter`);
  }
  fetchcontact(org_id:string,search:string): Observable<any> {
  return this.api.get(`${org_id}/contacts?search=${search}`);
  }
  savevincoice(org_id: string, data: any): Observable<any> {
    return this.api.post(`${org_id}/vouchers`, data);
  }
  editvoucher(org_id:string,cust_id:string): Observable<any> {
    return this.api.get(`${org_id}/vouchers/${cust_id}`);
  }
  saveinvoice(org_id:string,cust_id:string,paylod:any): Observable<any> {
    return this.api.put(`${org_id}/vouchers/${cust_id}`,paylod);
  }
  deletinvoice(org_id:string,cust_id:string): Observable<any> {
    return this.api.delete(`${org_id}/vouchers/${cust_id}`);
  }
}
