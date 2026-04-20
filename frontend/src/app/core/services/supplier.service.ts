import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/suppliers`;

  getAll(page = 1, pageSize = 10, search = '') {
    const params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize)
      .set('search', search);
    return this.http.get<PaginatedResponse<Supplier>>(this.base, { params });
  }

  getOne(id: number) {
    return this.http.get<Supplier>(`${this.base}/${id}`);
  }

  create(data: Partial<Supplier>) {
    return this.http.post<Supplier>(this.base, data);
  }

  update(id: number, data: Partial<Supplier>) {
    return this.http.put<Supplier>(`${this.base}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
