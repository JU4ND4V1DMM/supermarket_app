import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  total_suppliers: number;
  total_foods: number;
  total_transactions: number;
  total_revenue: number;
  food_stats: { name: string; count: number; revenue: number }[];
  recent_transactions: {
    id: number;
    food_id: number;
    quantity: number;
    total: number;
    transaction_type: string;
    is_anonymous: boolean;
    created_at: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getStats() {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`);
  }
}
