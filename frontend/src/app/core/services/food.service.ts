import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Supplier, PaginatedResponse } from './supplier.service';

export interface Food {
  id: number;
  name: string;
  purchase_price: number;
  sale_price: number;
  supplier_id: number;
  supplier?: Supplier;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class FoodService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/foods`;

  getAll(page = 1, pageSize = 10, search = '') {
    const params = new HttpParams().set('page', page).set('page_size', pageSize).set('search', search);
    return this.http.get<PaginatedResponse<Food>>(this.base, { params });
  }
  getAllNoPagination() { return this.http.get<Food[]>(`${this.base}/all`); }
  getOne(id: number) { return this.http.get<Food>(`${this.base}/${id}`); }
  create(data: Partial<Food>) { return this.http.post<Food>(this.base, data); }
  update(id: number, data: Partial<Food>) { return this.http.put<Food>(`${this.base}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.base}/${id}`); }
}
