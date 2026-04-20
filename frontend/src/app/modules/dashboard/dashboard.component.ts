import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div style="color:var(--text-1)">

      <!-- Header -->
      <div class="mb-7 animate-fade-up">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-6 rounded-full" style="background:linear-gradient(180deg,#0ea5e9,#6366f1)"></div>
          <h1 class="text-2xl font-extrabold tracking-tight" style="color:var(--text-1)">Panel Principal</h1>
        </div>
        <p class="ml-3.5 text-sm" style="color:var(--text-3)">Vista general de las operaciones del supermercado</p>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (stats()) {

        <!-- ── Stat Cards ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
          @for (card of statCards(); track card.label; let i = $index) {
            <div class="animate-fade-up relative overflow-hidden rounded-2xl p-5 cursor-default group transition-all duration-300 hover:-translate-y-1"
              [class]="'stagger-' + (i+1)"
              style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">

              <!-- Hover glow -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                [style]="'background:radial-gradient(circle at 50% 0%,' + card.glow + ' 0%,transparent 70%)'"></div>

              <!-- Top decoration line -->
              <div class="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-60"
                [style]="'background:' + card.iconColor"></div>

              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="w-11 h-11 rounded-xl flex items-center justify-center"
                    [style]="'background:' + card.iconBg">
                    <span [innerHTML]="card.icon" [style]="'color:' + card.iconColor" class="w-5 h-5 block"></span>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    style="background:var(--surface-3);color:var(--text-3)">Total</span>
                </div>
                <p class="text-3xl font-black stat-number mb-1" style="color:var(--text-1)">{{ card.value }}</p>
                <p class="text-sm font-medium" style="color:var(--text-2)">{{ card.label }}</p>
              </div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">

          <!-- ── Top productos ── -->
          <div class="xl:col-span-3 animate-fade-up stagger-3 rounded-2xl p-6"
            style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">

            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                  style="background:rgba(16,185,129,0.10);border:1px solid rgba(16,185,129,0.2)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:#059669" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <h2 class="font-bold text-sm" style="color:var(--text-1)">Productos más vendidos</h2>
              </div>
              <a routerLink="/transactions"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                style="color:var(--accent);background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.15)"
                onmouseenter="this.style.background='rgba(14,165,233,0.14)'"
                onmouseleave="this.style.background='rgba(14,165,233,0.08)'">Ver todo →</a>
            </div>

            @if (stats()!.food_stats.length === 0) {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-float"
                  style="background:var(--surface-3);border:1.5px solid var(--border)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" style="color:var(--text-4)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <p class="text-sm font-semibold" style="color:var(--text-2)">Sin datos aún</p>
                <p class="text-xs mt-1" style="color:var(--text-3)">Registra transacciones para ver estadísticas</p>
              </div>
            }

            <div class="space-y-3.5">
              @for (item of stats()!.food_stats.slice(0, 6); track item.name; let i = $index) {
                <div class="flex items-center gap-3">
                  <!-- Rank badge -->
                  <div class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style="background:rgba(14,165,233,0.10);color:var(--accent)">{{ i + 1 }}</div>

                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-sm font-semibold truncate" style="color:var(--text-1)">{{ item.name }}</span>
                      <span class="text-xs font-bold ml-2 flex-shrink-0" style="color:#059669">{{ item.count }} ventas</span>
                    </div>
                    <div class="h-1.5 rounded-full overflow-hidden" style="background:var(--surface-3)">
                      <div class="h-full rounded-full transition-all duration-700"
                        style="background:linear-gradient(90deg,#0ea5e9,#10b981)"
                        [style.width.%]="barWidth(item.count)"></div>
                    </div>
                  </div>
                  <span class="text-xs font-mono flex-shrink-0 font-semibold" style="color:var(--text-3)">
                    {{ item.revenue | currency:'COP':'symbol-narrow':'1.0-0' }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- ── Actividad reciente ── -->
          <div class="xl:col-span-2 animate-fade-up stagger-4 rounded-2xl p-6"
            style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">

            <div class="flex items-center gap-2.5 mb-5">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                style="background:rgba(99,102,241,0.10);border:1px solid rgba(99,102,241,0.2)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:#6366f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h2 class="font-bold text-sm" style="color:var(--text-1)">Actividad reciente</h2>
            </div>

            @if (stats()!.recent_transactions.length === 0) {
              <p class="text-sm text-center py-8" style="color:var(--text-3)">Sin transacciones aún</p>
            }

            <div class="space-y-2">
              @for (tx of stats()!.recent_transactions; track tx.id) {
                <div class="flex items-center justify-between p-3 rounded-xl transition-all"
                  style="background:var(--surface-3);border:1px solid transparent"
                  onmouseenter="this.style.borderColor='var(--border-accent)'"
                  onmouseleave="this.style.borderColor='transparent'">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      [style]="tx.transaction_type === 'sale'
                        ? 'background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.2)'
                        : 'background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.2)'">
                      @if (tx.transaction_type === 'sale') {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#059669" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#6366f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                      }
                    </div>
                    <div>
                      <p class="text-xs font-semibold" style="color:var(--text-1)">#{{ tx.id }} · {{ tx.transaction_type === 'sale' ? 'Venta' : 'Compra' }}</p>
                      <p class="text-xs mt-0.5" style="color:var(--text-3)">{{ tx.created_at | date:'d MMM, h:mm a' }}</p>
                    </div>
                  </div>
                  <span class="text-sm font-black stat-number"
                    [style]="tx.transaction_type === 'sale' ? 'color:#059669' : 'color:#6366f1'">
                    {{ tx.total | currency:'COP':'symbol-narrow':'1.0-0' }}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private dashService = inject(DashboardService);
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.dashService.getStats().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statCards() {
    const s = this.stats()!;
    return [
      {
        label: 'Proveedores', value: s.total_suppliers,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
        iconBg: 'rgba(99,102,241,0.10)', iconColor: '#6366f1', glow: 'rgba(99,102,241,0.06)',
      },
      {
        label: 'Productos', value: s.total_foods,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
        iconBg: 'rgba(251,146,60,0.10)', iconColor: '#ea580c', glow: 'rgba(251,146,60,0.06)',
      },
      {
        label: 'Transacciones', value: s.total_transactions,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
        iconBg: 'rgba(16,185,129,0.10)', iconColor: '#059669', glow: 'rgba(16,185,129,0.06)',
      },
      {
        label: 'Ingresos totales',
        value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(s.total_revenue),
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
        iconBg: 'rgba(234,179,8,0.10)', iconColor: '#ca8a04', glow: 'rgba(234,179,8,0.06)',
      },
    ];
  }

  barWidth(count: number): number {
    const max = Math.max(...(this.stats()?.food_stats.map((f) => f.count) ?? [1]), 1);
    return (count / max) * 100;
  }
}
