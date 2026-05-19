import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Food } from './food.service';
import { User } from './auth.service';
import { PaginatedResponse } from './supplier.service';

export interface TransactionItem {
  id: number;
  food_id: number;
  food?: Food;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
export interface Transaction {
  id: number;
  transaction_type: 'sale' | 'purchase';
  total: number;
  items: TransactionItem[];
  batch_number: string | null;
  origin: string | null;
  notes: string | null;
  is_anonymous: boolean;
  customer_id: number | null;
  customer?: User | null;
  created_at: string;
}
export interface TransactionCreate {
  transaction_type: 'sale' | 'purchase';
  items: { food_id: number; quantity: number }[];
  batch_number?: string;
  origin?: string;
  notes?: string;
  is_anonymous: boolean;
  customer_id?: number | null;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/transactions`;

  getAll(page = 1, pageSize = 10, filters: { transaction_type?: string; date_from?: string; date_to?: string } = {}) {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (filters.transaction_type) params = params.set('transaction_type', filters.transaction_type);
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);
    return this.http.get<PaginatedResponse<Transaction>>(this.base, { params });
  }
  getOne(id: number) { return this.http.get<Transaction>(`${this.base}/${id}`); }
  create(data: TransactionCreate) { return this.http.post<Transaction>(this.base, data); }
  delete(id: number) { return this.http.delete(`${this.base}/${id}`); }
}
