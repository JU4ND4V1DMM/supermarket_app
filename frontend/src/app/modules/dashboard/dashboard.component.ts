import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

import {
  LucideAngularModule,
  Truck,
  Package,
  ReceiptText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock3
} from 'lucide-angular';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(n);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SpinnerComponent,
    DatePipe,
    LucideAngularModule
  ],
  template: `
    <div>

      <!-- HEADER -->
      <div class="mb-8 animate-fade-up">

        <div class="flex items-center gap-3 mb-2">

          <div class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">

            <lucide-icon [img]="Activity"
              class="w-5 h-5 text-white">
            </lucide-icon>

          </div>

          <div>

            <h1 class="text-2xl font-extrabold tracking-tight"
              style="color:var(--text-1)">

              Panel Principal

            </h1>

            <p class="text-sm"
              style="color:var(--text-4)">

              Vista general de operaciones — Legumbría La Bendición

            </p>

          </div>

        </div>

      </div>

      @if (loading()) {

        <app-spinner />

      } @else if (stats()) {

        <!-- STATS -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          @for (c of statCards(); track c.label; let i = $index) {

            <div
              class="animate-fade-up relative overflow-hidden rounded-3xl p-5 group hover:-translate-y-1 transition-all duration-300"
              [class]="'stagger-' + (i+1)"
              style="background:#fff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">

              <div
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                [style]="'background:' + c.glow">
              </div>

              <div class="relative z-10">

                <div class="flex items-start justify-between mb-5">

                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
                    [style]="'background:' + c.bg">

                    @if (c.icon === 'truck') {
                      <lucide-icon [img]="Truck"
                        class="w-5 h-5"
                        [style]="'color:' + c.color">
                      </lucide-icon>
                    }

                    @if (c.icon === 'package') {
                      <lucide-icon [img]="Package"
                        class="w-5 h-5"
                        [style]="'color:' + c.color">
                      </lucide-icon>
                    }

                    @if (c.icon === 'receipt') {
                      <lucide-icon [img]="ReceiptText"
                        class="w-5 h-5"
                        [style]="'color:' + c.color">
                      </lucide-icon>
                    }

                    @if (c.icon === 'dollar') {
                      <lucide-icon [img]="DollarSign"
                        class="w-5 h-5"
                        [style]="'color:' + c.color">
                      </lucide-icon>
                    }

                  </div>

                  <span
                    class="text-[11px] font-bold px-2 py-1 rounded-full"
                    style="background:var(--surface-3);color:var(--text-4)">

                    GENERAL

                  </span>

                </div>

                <p class="text-2xl font-black mb-1 stat-number"
                  style="color:var(--text-1)">

                  {{ c.value }}

                </p>

                <p class="text-xs font-semibold"
                  style="color:var(--text-4)">

                  {{ c.label }}

                </p>

              </div>

            </div>

          }

        </div>

        <!-- PROFITS -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div class="rounded-3xl p-5"
            style="background:rgba(16,185,129,.06);border:1.5px solid rgba(16,185,129,.15)">

            <div class="flex items-center gap-3">

              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                style="background:rgba(16,185,129,.12)">

                <lucide-icon [img]="TrendingUp"
                  class="w-5 h-5 text-emerald-600">
                </lucide-icon>

              </div>

              <div>

                <p class="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Ventas Totales
                </p>

                <p class="text-xl font-black text-emerald-600">
                  {{ cop(stats()!.total_sales) }}
                </p>

              </div>

            </div>

          </div>

          <div class="rounded-3xl p-5"
            style="background:rgba(99,102,241,.06);border:1.5px solid rgba(99,102,241,.15)">

            <div class="flex items-center gap-3">

              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                style="background:rgba(99,102,241,.12)">

                <lucide-icon [img]="ShoppingCart"
                  class="w-5 h-5 text-indigo-500">
                </lucide-icon>

              </div>

              <div>

                <p class="text-xs font-bold uppercase tracking-widest text-indigo-500">
                  Compras Totales
                </p>

                <p class="text-xl font-black text-indigo-500">
                  {{ cop(stats()!.total_purchases) }}
                </p>

              </div>

            </div>

          </div>

          <div class="rounded-3xl p-5"
            [style]="stats()!.total_profit >= 0
              ? 'background:rgba(16,185,129,.06);border:1.5px solid rgba(16,185,129,.15)'
              : 'background:rgba(244,63,94,.06);border:1.5px solid rgba(244,63,94,.15)'">

            <div class="flex items-center gap-3">

              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                [style]="stats()!.total_profit >= 0
                  ? 'background:rgba(16,185,129,.12)'
                  : 'background:rgba(244,63,94,.12)'">

                @if (stats()!.total_profit >= 0) {

                  <lucide-icon [img]="ArrowUpRight"
                    class="w-5 h-5 text-emerald-600">
                  </lucide-icon>

                } @else {

                  <lucide-icon [img]="ArrowDownRight"
                    class="w-5 h-5 text-rose-600">
                  </lucide-icon>

                }

              </div>

              <div>

                <p
                  class="text-xs font-bold uppercase tracking-widest"
                  [style]="stats()!.total_profit >= 0 ? 'color:#059669' : 'color:#e11d48'">

                  {{ stats()!.total_profit >= 0 ? 'Ganancia Neta' : 'Pérdida' }}

                </p>

                <p
                  class="text-xl font-black"
                  [style]="stats()!.total_profit >= 0 ? 'color:#059669' : 'color:#e11d48'">

                  {{ cop(stats()!.total_profit) }}

                </p>

              </div>

            </div>

          </div>

        </div>

        <!-- CONTENT -->
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">

          <!-- TOP PRODUCTS -->
          <div class="xl:col-span-3 rounded-3xl p-6 animate-fade-up"
            style="background:#fff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">

            <div class="flex items-center justify-between mb-6">

              <div class="flex items-center gap-3">

                <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.15)">

                  <lucide-icon [img]="TrendingUp"
                    class="w-5 h-5 text-emerald-600">
                  </lucide-icon>

                </div>

                <div>

                  <h2 class="text-sm font-bold"
                    style="color:var(--text-1)">

                    Productos más vendidos

                  </h2>

                  <p class="text-xs"
                    style="color:var(--text-4)">

                    Ranking de productos con más movimiento

                  </p>

                </div>

              </div>

              <a routerLink="/transactions"
                class="text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                style="background:rgba(99,102,241,.08);color:#6366f1">

                Ver todo

                <lucide-icon [img]="ArrowUpRight"
                  class="w-3.5 h-3.5">
                </lucide-icon>

              </a>

            </div>

            @if (!stats()!.food_stats.length) {

              <div class="flex flex-col items-center justify-center py-14">

                <lucide-icon [img]="Package"
                  class="w-10 h-10 opacity-30 mb-3">
                </lucide-icon>

                <p class="text-sm font-semibold"
                  style="color:var(--text-4)">

                  Sin datos aún

                </p>

              </div>

            } @else {

              <div class="space-y-4">

                @for (item of stats()!.food_stats.slice(0,6); track item.name; let i = $index) {

                  <div class="flex items-center gap-4">

                    <div
                      class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                      style="background:rgba(99,102,241,.1);color:#6366f1">

                      {{ i + 1 }}

                    </div>

                    <div class="flex-1 min-w-0">

                      <div class="flex justify-between items-center mb-1.5">

                        <span class="text-sm font-semibold truncate"
                          style="color:var(--text-1)">

                          {{ item.name }}

                        </span>

                        <span class="text-xs font-bold text-emerald-600">

                          {{ item.count }} uds

                        </span>

                      </div>

                      <div class="h-2 rounded-full overflow-hidden"
                        style="background:var(--surface-3)">

                        <div
                          class="h-full rounded-full transition-all duration-700"
                          style="background:linear-gradient(90deg,#6366f1,#10b981)"
                          [style.width.%]="barWidth(item.count)">
                        </div>

                      </div>

                    </div>

                    <span class="text-xs font-black"
                      style="color:var(--text-4)">

                      {{ cop(item.revenue) }}

                    </span>

                  </div>

                }

              </div>

            }

          </div>

          <!-- RECENT ACTIVITY -->
          <div class="xl:col-span-2 rounded-3xl p-6 animate-fade-up"
            style="background:#fff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">

            <div class="flex items-center gap-3 mb-6">

              <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
                style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.15)">

                <lucide-icon [img]="Clock3"
                  class="w-5 h-5 text-amber-600">
                </lucide-icon>

              </div>

              <div>

                <h2 class="text-sm font-bold"
                  style="color:var(--text-1)">

                  Actividad reciente

                </h2>

                <p class="text-xs"
                  style="color:var(--text-4)">

                  Últimos movimientos registrados

                </p>

              </div>

            </div>

            @if (!stats()!.recent_transactions.length) {

              <p class="text-sm text-center py-10"
                style="color:var(--text-4)">

                Sin transacciones aún

              </p>

            } @else {

              <div class="space-y-3">

                @for (tx of stats()!.recent_transactions; track tx.id) {

                  <div
                    class="p-4 rounded-2xl transition-all duration-200"
                    style="background:var(--surface-2);border:1px solid var(--border)">

                    <div class="flex items-center justify-between">

                      <div class="flex items-center gap-3">

                        <div
                          class="w-10 h-10 rounded-xl flex items-center justify-center"
                          [style]="tx.transaction_type === 'sale'
                            ? 'background:rgba(16,185,129,.1)'
                            : 'background:rgba(99,102,241,.1)'">

                          @if (tx.transaction_type === 'sale') {

                            <lucide-icon [img]="ArrowUpRight"
                              class="w-4 h-4 text-emerald-600">
                            </lucide-icon>

                          } @else {

                            <lucide-icon [img]="ArrowDownRight"
                              class="w-4 h-4 text-indigo-500">
                            </lucide-icon>

                          }

                        </div>

                        <div>

                          <p class="text-sm font-bold"
                            style="color:var(--text-1)">

                            #{{ tx.id }} · {{ tx.transaction_type === 'sale' ? 'Venta' : 'Compra' }}

                          </p>

                          <p class="text-xs"
                            style="color:var(--text-4)">

                            {{ tx.created_at | date:'d MMM, h:mm a' }}

                          </p>

                        </div>

                      </div>

                      <span
                        class="text-sm font-black"
                        [style]="tx.transaction_type === 'sale'
                          ? 'color:#059669'
                          : 'color:#6366f1'">

                        {{ cop(tx.total) }}

                      </span>

                    </div>

                  </div>

                }

              </div>

            }

          </div>

        </div>

      }

    </div>
  `
})
export class DashboardComponent implements OnInit {

  Truck = Truck;
  Package = Package;
  ReceiptText = ReceiptText;
  DollarSign = DollarSign;
  TrendingUp = TrendingUp;
  TrendingDown = TrendingDown;
  Activity = Activity;
  ShoppingCart = ShoppingCart;
  ArrowUpRight = ArrowUpRight;
  ArrowDownRight = ArrowDownRight;
  Clock3 = Clock3;

  private ds = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.ds.getStats().subscribe({
      next: (d) => {
        this.stats.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  cop(n: number) {
    return COP(n);
  }

  statCards() {
    const s = this.stats()!;

    return [
      {
        label: 'Proveedores',
        value: s.total_suppliers,
        icon: 'truck',
        color: '#6366f1',
        bg: 'rgba(99,102,241,.08)',
        glow: 'radial-gradient(circle at top, rgba(99,102,241,.12), transparent 70%)'
      },
      {
        label: 'Productos',
        value: s.total_foods,
        icon: 'package',
        color: '#f97316',
        bg: 'rgba(249,115,22,.08)',
        glow: 'radial-gradient(circle at top, rgba(249,115,22,.12), transparent 70%)'
      },
      {
        label: 'Transacciones',
        value: s.total_transactions,
        icon: 'receipt',
        color: '#10b981',
        bg: 'rgba(16,185,129,.08)',
        glow: 'radial-gradient(circle at top, rgba(16,185,129,.12), transparent 70%)'
      },
      {
        label: 'Ganancia Neta',
        value: COP(s.total_profit),
        icon: 'dollar',
        color: s.total_profit >= 0 ? '#059669' : '#e11d48',
        bg: s.total_profit >= 0
          ? 'rgba(16,185,129,.08)'
          : 'rgba(244,63,94,.08)',
        glow: s.total_profit >= 0
          ? 'radial-gradient(circle at top, rgba(16,185,129,.12), transparent 70%)'
          : 'radial-gradient(circle at top, rgba(244,63,94,.12), transparent 70%)'
      }
    ];
  }

  barWidth(count: number) {
    const max = Math.max(
      ...(this.stats()?.food_stats.map(f => f.count) ?? [1]),
      1
    );

    return (count / max) * 100;
  }
}