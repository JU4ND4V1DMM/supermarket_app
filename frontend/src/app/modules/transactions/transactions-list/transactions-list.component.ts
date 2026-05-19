import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { trigger, transition, style, animate } from '@angular/animations';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent, SpinnerComponent, ConfirmDialogComponent, DatePipe, DropdownModule, CalendarModule],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('380ms cubic-bezier(.22,.68,0,1.2)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    <div @fadeUp>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-7 rounded-full" style="background:linear-gradient(180deg,#6366f1,#f472b6)"></div>
            <h1 class="text-2xl font-extrabold tracking-tight" style="color:var(--text-1)">Transacciones</h1>
          </div>
          <p class="ml-3.5 text-sm" style="color:var(--text-4)">Registro completo de ventas y compras en COP</p>
        </div>
        <a routerLink="/transactions/new"
          class="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva transacción
        </a>
      </div>

      <!-- Filters -->
      <div class="rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">Tipo</label>
          <p-dropdown
            [options]="typeOptions"
            [(ngModel)]="filterType"
            (ngModelChange)="onFilter()"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            styleClass="w-full"
            appendTo="body">
          </p-dropdown>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">Desde</label>
          <p-calendar
            [(ngModel)]="dateFrom"
            (ngModelChange)="onFilter()"
            dateFormat="yy-mm-dd"
            [showIcon]="true"
            placeholder="Fecha inicio"
            styleClass="w-full"
            appendTo="body"
            [readonlyInput]="true">
          </p-calendar>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">Hasta</label>
          <p-calendar
            [(ngModel)]="dateTo"
            (ngModelChange)="onFilter()"
            dateFormat="yy-mm-dd"
            [showIcon]="true"
            placeholder="Fecha fin"
            styleClass="w-full"
            appendTo="body"
            [readonlyInput]="true">
          </p-calendar>
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

      @if (loading()) {
        <app-spinner />
      } @else if (!transactions().length) {
        <div class="flex flex-col items-center py-20 rounded-3xl"
          style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
            style="background:rgba(99,102,241,0.07);border:1.5px solid rgba(99,102,241,0.15)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" style="color:var(--accent)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="2"/>
            </svg>
          </div>
          <p class="font-bold" style="color:var(--text-1)">Sin transacciones</p>
          <a routerLink="/transactions/new" class="mt-4 btn-primary px-5 py-2 rounded-xl text-sm font-bold cursor-pointer">
            + Nueva transacción
          </a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (tx of transactions(); track tx.id) {
            <div class="flex items-start justify-between gap-4 p-5 rounded-2xl transition-all"
              style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm);cursor:pointer"
              onmouseenter="this.style.borderColor='rgba(99,102,241,0.3)';this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-1px)'"
              onmouseleave="this.style.borderColor='var(--border)';this.style.boxShadow='var(--shadow-sm)';this.style.transform=''">

              <div class="flex items-start gap-4 flex-1 min-w-0">
                <!-- Type icon -->
                <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  [style]="tx.transaction_type === 'sale'
                    ? 'background:rgba(16,185,129,0.1);border:1.5px solid rgba(16,185,129,0.2)'
                    : 'background:rgba(99,102,241,0.1);border:1.5px solid rgba(99,102,241,0.2)'">
                  @if (tx.transaction_type === 'sale') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" style="color:#059669" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" style="color:#6366f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                    </svg>
                  }
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <span class="font-extrabold text-sm stat-number" style="color:var(--text-1)">#{{ tx.id }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-lg font-bold"
                      [class]="tx.transaction_type === 'sale' ? 'badge-sale' : 'badge-purchase'">
                      {{ tx.transaction_type === 'sale' ? '↑ Venta' : '↓ Compra' }}
                    </span>
                    <span class="text-xs px-2 py-0.5 rounded-lg font-semibold"
                      style="background:rgba(249,115,22,0.08);color:#ea580c;border:1px solid rgba(249,115,22,0.2)">
                      {{ tx.items.length }} producto{{ tx.items.length !== 1 ? 's' : '' }}
                    </span>
                  </div>

                  <!-- Items preview — computed in TS to avoid arrow fn in template -->
                  <p class="text-xs truncate mb-1" style="color:var(--text-4)">
                    {{ itemsPreview(tx) }}
                  </p>

                  <div class="flex flex-wrap gap-x-4 text-xs" style="color:var(--text-4)">
                    @if (tx.batch_number) {
                      <span>Lote: <span class="font-semibold" style="color:var(--text-1)">{{ tx.batch_number }}</span></span>
                    }
                    @if (tx.origin) {
                      <span>Origen: <span class="font-semibold" style="color:var(--text-1)">{{ tx.origin }}</span></span>
                    }
                  </div>
                </div>
              </div>

              <!-- Amount + Date + Actions -->
              <div class="text-right flex-shrink-0 flex flex-col items-end gap-2">
                <p class="text-xl font-black stat-number"
                  [style]="tx.transaction_type === 'sale' ? 'color:#059669' : 'color:#6366f1'">
                  {{ cop(tx.total) }}
                </p>
                <p class="text-xs" style="color:var(--text-4)">{{ tx.created_at | date:'d MMM, h:mm a' }}</p>
                <div class="flex items-center gap-2">
                  <a [routerLink]="['/transactions', tx.id]"
                    class="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all"
                    style="background:rgba(99,102,241,0.07);color:var(--accent);border:1px solid rgba(99,102,241,0.15)"
                    onmouseenter="this.style.background='rgba(99,102,241,0.13)'"
                    onmouseleave="this.style.background='rgba(99,102,241,0.07)'">Ver detalle</a>
                  <button (click)="confirmDelete(tx)"
                    class="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                    style="color:var(--text-4)"
                    onmouseenter="this.style.background='rgba(244,63,94,0.1)';this.style.color='#e11d48'"
                    onmouseleave="this.style.background='transparent';this.style.color='var(--text-4)'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="mt-5">
          <app-pagination
            [page]="page()"
            [pageSize]="pageSize"
            [total]="total()"
            [totalPages]="totalPages()"
            (pageChange)="onPage($event)" />
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="showConfirm()"
      title="Eliminar transacción"
      [message]="deleteMessage()"
      (confirm)="deleteConfirmed()"
      (cancel)="showConfirm.set(false)" />
  `,
})
export class TransactionsListComponent implements OnInit {
  private txSvc = inject(TransactionService);
  private toast = inject(ToastService);

  transactions = signal<Transaction[]>([]);
  loading = signal(true);
  page = signal(1); total = signal(0); totalPages = signal(1); pageSize = 10;
  filterType: string | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  showConfirm = signal(false);
  deletingTx = signal<Transaction | null>(null);

  typeOptions = [
    { label: 'Todos los tipos', value: null },
    { label: '↑ Ventas', value: 'sale' },
    { label: '↓ Compras', value: 'purchase' },
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const filters: any = {};
    if (this.filterType) filters.transaction_type = this.filterType;
    if (this.dateFrom) filters.date_from = this.dateFrom.toISOString().split('T')[0];
    if (this.dateTo) filters.date_to = this.dateTo.toISOString().split('T')[0];
    this.txSvc.getAll(this.page(), this.pageSize, filters).subscribe({
      next: (r) => {
        this.transactions.set(r.items);
        this.total.set(r.total);
        this.totalPages.set(r.total_pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilter() { this.page.set(1); this.load(); }
  onPage(p: number) { this.page.set(p); this.load(); }
  clearFilters() { this.filterType = null; this.dateFrom = null; this.dateTo = null; this.page.set(1); this.load(); }
  cop(n: number) { return COP(n); }

  /** Moved out of template to avoid arrow fn parser error */
  itemsPreview(tx: Transaction): string {
    return tx.items.map(i => (i.food?.name ?? '?') + ' ×' + i.quantity).join(' · ');
  }

  deleteMessage(): string {
    const id = this.deletingTx()?.id ?? '';
    return `¿Eliminar la transacción #${id}? Esta acción no se puede deshacer.`;
  }

  confirmDelete(tx: Transaction) { this.deletingTx.set(tx); this.showConfirm.set(true); }

  deleteConfirmed() {
    const tx = this.deletingTx();
    if (!tx) return;
    this.txSvc.delete(tx.id).subscribe({
      next: () => { this.toast.success('Transacción eliminada'); this.showConfirm.set(false); this.load(); },
      error: (e) => { this.toast.error(e.error?.detail ?? 'Error'); this.showConfirm.set(false); },
    });
  }
}
