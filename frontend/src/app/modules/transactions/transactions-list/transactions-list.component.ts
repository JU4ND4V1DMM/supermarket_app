import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { FoodService, Food } from '../../../core/services/food.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, SpinnerComponent, CurrencyPipe, DatePipe],
  animations: [
    trigger('fadeUp', [transition(':enter', [style({ opacity: 0, transform: 'translateY(16px)' }), animate('400ms cubic-bezier(.22,.68,0,1.2)', style({ opacity: 1, transform: 'translateY(0)' }))])]),
  ],
  template: `
    <div @fadeUp>

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-6 rounded-full" style="background:linear-gradient(180deg,var(--accent),var(--accent-2))"></div>
            <h1 class="text-2xl font-extrabold tracking-tight" style="color:var(--text-1)">Transacciones</h1>
          </div>
          <p class="ml-3.5 text-sm" style="color:var(--text-3)">Registro completo de ventas y compras con trazabilidad</p>
        </div>
        <a routerLink="/transactions/new"
          class="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-bold cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva transacción
        </a>
      </div>

      <!-- Filtros -->
      <div class="rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">Producto</label>
          <div class="relative">
            <select [(ngModel)]="filters.food_id" (ngModelChange)="onFilter()"
              class="inp w-full px-3 py-2.5 text-sm cursor-pointer pr-8 appearance-none"
              style="color:var(--text-1)">
              <option [value]="undefined">Todos los productos</option>
              @for (f of allFoods(); track f.id) {
                <option [value]="f.id">{{ f.name }}</option>
              }
            </select>
            <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color:var(--text-3)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">Desde</label>
          <input type="date" [(ngModel)]="filters.date_from" (ngModelChange)="onFilter()"
            class="inp w-full px-3 py-2.5 text-sm" style="color:var(--text-1)"/>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">Hasta</label>
          <input type="date" [(ngModel)]="filters.date_to" (ngModelChange)="onFilter()"
            class="inp w-full px-3 py-2.5 text-sm" style="color:var(--text-1)"/>
        </div>
        <div class="flex items-end">
          <button (click)="clearFilters()"
            class="w-full px-3 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            style="background:var(--surface-3);color:var(--text-2);border:1.5px solid var(--border)"
            onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
            onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text-2)'">
            Limpiar filtros
          </button>
        </div>
      </div>

      @if (loading()) { <app-spinner /> }
      @else if (transactions().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 rounded-3xl"
          style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
            style="background:linear-gradient(135deg,rgba(14,165,233,0.08),rgba(14,165,233,0.04));border:1.5px solid rgba(14,165,233,0.15)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" style="color:var(--accent)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <p class="font-bold text-base" style="color:var(--text-1)">Sin transacciones</p>
          <p class="text-sm mt-1" style="color:var(--text-3)">Registra tu primera transacción para comenzar</p>
          <a routerLink="/transactions/new" class="mt-5 btn-primary px-5 py-2 rounded-xl text-sm font-bold text-white cursor-pointer">
            + Nueva transacción
          </a>
        </div>
      }
      @else {
        <div class="space-y-3">
          @for (tx of transactions(); track tx.id) {
            <a [routerLink]="['/transactions', tx.id]"
              class="flex items-start justify-between gap-4 p-5 rounded-2xl transition-all cursor-pointer group"
              style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)"
              onmouseenter="this.style.borderColor='rgba(14,165,233,0.3)';this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-1px)'"
              onmouseleave="this.style.borderColor='var(--border)';this.style.boxShadow='var(--shadow-sm)';this.style.transform=''">

              <div class="flex items-start gap-4 flex-1 min-w-0">
                <!-- Icon -->
                <div class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                  [style]="tx.transaction_type === 'sale'
                    ? 'background:rgba(16,185,129,0.1);border:1.5px solid rgba(16,185,129,0.2)'
                    : 'background:rgba(99,102,241,0.1);border:1.5px solid rgba(99,102,241,0.2)'">
                  @if (tx.transaction_type === 'sale') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" style="color:#059669" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                  }
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <span class="font-extrabold text-sm stat-number" style="color:var(--text-1)">#{{ tx.id }} — {{ tx.food?.name ?? 'Desconocido' }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-lg font-bold"
                      [class]="tx.transaction_type === 'sale' ? 'badge-sale' : 'badge-purchase'">
                      {{ tx.transaction_type === 'sale' ? '↑ Venta' : '↓ Compra' }}
                    </span>
                    @if (tx.is_anonymous) {
                      <span class="text-xs px-2 py-0.5 rounded-lg font-semibold badge-anon">Anónimo</span>
                    }
                  </div>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs" style="color:var(--text-3)">
                    <span>Cant: <span class="font-semibold" style="color:var(--text-1)">{{ tx.quantity }}</span></span>
                    @if (tx.batch_number) { <span>Lote: <span class="font-semibold" style="color:var(--text-1)">{{ tx.batch_number }}</span></span> }
                    @if (tx.origin) { <span>Origen: <span class="font-semibold" style="color:var(--text-1)">{{ tx.origin }}</span></span> }
                    @if (!tx.is_anonymous && tx.customer) { <span>Cliente: <span class="font-semibold" style="color:var(--text-1)">{{ tx.customer.full_name }}</span></span> }
                  </div>
                </div>
              </div>

              <!-- Amount + Date -->
              <div class="text-right flex-shrink-0">
                <p class="text-xl font-black stat-number"
                  [style]="tx.transaction_type === 'sale' ? 'color:#059669' : 'color:#6366f1'">
                  {{ tx.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                </p>
                <p class="text-xs mt-1" style="color:var(--text-3)">{{ tx.created_at | date:'d MMM, h:mm a' }}</p>
              </div>
            </a>
          }
        </div>

        <div class="mt-5">
          <app-pagination [page]="page()" [pageSize]="pageSize" [total]="total()" [totalPages]="totalPages()" (pageChange)="onPage($event)" />
        </div>
      }
    </div>
  `,
})
export class TransactionsListComponent implements OnInit {
  private txSvc = inject(TransactionService);
  private foodSvc = inject(FoodService);

  transactions = signal<Transaction[]>([]); allFoods = signal<Food[]>([]);
  loading = signal(true); page = signal(1); total = signal(0); totalPages = signal(1); pageSize = 10;
  filters: { food_id?: number; date_from?: string; date_to?: string } = {};

  ngOnInit() { this.foodSvc.getAllNoPagination().subscribe((f) => this.allFoods.set(f)); this.load(); }

  load() {
    this.loading.set(true);
    this.txSvc.getAll(this.page(), this.pageSize, this.filters).subscribe({
      next: (res) => { this.transactions.set(res.items); this.total.set(res.total); this.totalPages.set(res.total_pages); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onFilter() { this.page.set(1); this.load(); }
  onPage(p: number) { this.page.set(p); this.load(); }
  clearFilters() { this.filters = {}; this.page.set(1); this.load(); }
}
