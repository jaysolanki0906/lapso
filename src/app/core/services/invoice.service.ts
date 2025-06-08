import { Injectable } from '@angular/core';
import { ApiServiceService } from './api-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private api:ApiServiceService) { }
  getdata(org_id: string, page = 1, limit = 20): Observable<any> {
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const offset = (page - 1) * limit;
  return this.api.get(`${org_id}/vouchers?offset=${offset}&limit=${limit}`);
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
}
