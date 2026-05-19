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
  Clock3,
  BarChart3,
  Zap,
  Coins
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
  // SOLO reemplaza el bloque de estilos (styles: [`...`]) por este:

  styles: [`
  :host {
    --bg: #f7f6f3;
    --card: #ffffff;
    --border: rgba(0,0,0,.07);
    --border-s: rgba(0,0,0,.11);
    --text-1: #0d0c0a;
    --text-2: #3b3a36;
    --text-3: #6e6c66;
    --text-4: #a09e98;
    --indigo: #4338ca;
    --indigo-l: #eef2ff;
    --emerald: #047857;
    --emerald-l: #d1fae5;
    --amber: #b45309;
    --amber-l: #fef3c7;
    --rose: #be123c;
    --rose-l: #ffe4e6;
    --orange: #c2410c;
    --shadow-xs: 0 1px 3px rgba(0,0,0,.05);
    --shadow-sm: 0 4px 16px rgba(0,0,0,.06);
    --shadow-md: 0 8px 32px rgba(0,0,0,.09);
  }
  /* ─── TIPOGRAFÍA MÁS GRUESA (como antes) ─── */
  * {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  }
  .hdr-title, .card-value, .metric-val, .tx-amount {
    font-weight: 800 !important;
    letter-spacing: -0.02em !important;
  }
  .card-value {
    font-size: 2.2rem !important;
    font-weight: 800 !important;
  }
  .card-value-sm {
    font-size: 1.6rem !important;
  }
  .metric-val {
    font-size: 1.3rem !important;
    font-weight: 800 !important;
  }
  .tx-amount {
    font-weight: 800 !important;
  }
  .prod-name, .tx-id, .section-title, .hdr-sub, .card-label, .metric-lbl {
    font-weight: 600 !important;
  }
  .stat-number {
    font-weight: 800 !important;
    letter-spacing: -0.01em !important;
  }
  /* ─── ANIMACIONES (se mantienen) ─── */
  @keyframes fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse-dot {
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:.4;transform:scale(.7)}
  }
  @keyframes shimmer {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  @keyframes bar-in {
    from { width: 0 !important; }
  }
  .animate-in { animation: fade-up .45s ease both; }
  .s1 { animation-delay:.04s } .s2 { animation-delay:.08s }
  .s3 { animation-delay:.12s } .s4 { animation-delay:.16s }
  .s5 { animation-delay:.20s } .s6 { animation-delay:.24s }
  /* ─── HEADER ─────────────────────────── */
  .hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
  .hdr-left { display:flex; align-items:center; gap:14px; }
  .hdr-icon {
    width:52px; height:52px; border-radius:18px; flex-shrink:0;
    background:linear-gradient(135deg,#4338ca,#6d28d9);
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 8px 24px rgba(67,56,202,.35);
  }
  .hdr-title {
    font-size:1.85rem;
    line-height:1; color:var(--text-1);
  }
  .hdr-sub { font-size:12.5px; color:var(--text-3); margin-top:3px; }
  .live-pill {
    display:inline-flex; align-items:center; gap:5px;
    font-size:10.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    background:var(--indigo-l); color:var(--indigo);
    border:1px solid rgba(67,56,202,.18); padding:4px 11px; border-radius:99px;
  }
  .live-dot {
    width:6px; height:6px; border-radius:50%; background:#4338ca;
    animation:pulse-dot 1.8s ease-in-out infinite; display:inline-block;
  }
  .hdr-date {
    background:var(--card); border:1.5px solid var(--border);
    border-radius:14px; padding:8px 16px; text-align:right; flex-shrink:0;
  }
  .hdr-date-lbl { font-size:10px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:var(--text-4); }
  .hdr-date-val { font-size:13.5px; font-weight:700; color:var(--text-1); margin-top:1px; }
  /* ─── STAT CARDS ─────────────────────── */
  .stat-grid {
    display:grid; grid-template-columns:repeat(4,1fr);
    gap:14px; margin-bottom:18px;
  }
  .stat-card {
    background:var(--card); border:1.5px solid var(--border);
    border-radius:24px; padding:22px 22px 20px;
    position:relative; overflow:hidden;
    transition:transform .22s ease, box-shadow .22s ease;
    cursor:default; box-shadow:var(--shadow-xs);
  }
  .stat-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
  .card-bg-svg {
    position:absolute; inset:0; pointer-events:none;
    overflow:hidden; border-radius:24px;
  }
  .card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; position:relative; z-index:1; }
  .card-icon {
    width:44px; height:44px; border-radius:14px;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .sparkline-bars { display:flex; align-items:flex-end; gap:2.5px; height:28px; }
  .spark-bar { width:5px; border-radius:3px; display:inline-block; }
  .card-value {
    letter-spacing:-.04em; line-height:1;
    color:var(--text-1); position:relative; z-index:1;
  }
  .card-meta {
    display:flex; align-items:center; justify-content:space-between;
    margin-top:8px; position:relative; z-index:1;
  }
  .card-label { font-size:12px; font-weight:600; color:var(--text-3); }
  .card-pct {
    display:inline-flex; align-items:center; gap:3px;
    font-size:11px; font-weight:700;
    padding:3px 8px; border-radius:99px;
  }
  .card-bottom-line {
    position:absolute; bottom:0; left:16px; right:16px;
    height:2.5px; border-radius:99px;
  }
  /* ─── METRIC ROW ─────────────────────── */
  .metric-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
  .metric-card { border-radius:20px; padding:18px 20px; position:relative; overflow:hidden; }
  .metric-top-line { position:absolute; top:0; left:16px; right:16px; height:2px; border-radius:99px; }
  .metric-icon { width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .metric-lbl { font-size:10px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; margin-bottom:3px; }
  .metric-val { letter-spacing:-.03em; line-height:1.1; }
  /* ─── SECTION CARDS ──────────────────── */
  .content-grid { display:grid; grid-template-columns:3fr 2fr; gap:16px; }
  .section-card {
    background:var(--card); border:1.5px solid var(--border);
    border-radius:24px; padding:24px;
    box-shadow:var(--shadow-xs);
    transition:box-shadow .2s ease;
  }
  .section-card:hover { box-shadow:var(--shadow-sm); }
  .section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
  .section-icon { width:40px; height:40px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .section-title { font-size:1.15rem; letter-spacing:-.025em; color:var(--text-1); }
  .section-sub { font-size:11px; color:var(--text-4); font-weight:500; margin-top:1px; }
  .section-divider { width:100%; height:1px; background:linear-gradient(90deg,transparent,var(--border-s),transparent); margin:14px 0; }
  .view-btn {
    display:inline-flex; align-items:center; gap:4px;
    font-size:11.5px; font-weight:700; padding:6px 13px; border-radius:10px;
    background:var(--indigo-l); color:var(--indigo);
    text-decoration:none; transition:background .15s;
  }
  .view-btn:hover { background:#e0e7ff; }
  /* ─── PRODUCT LIST ───────────────────── */
  .prod-item { display:flex; align-items:center; gap:11px; }
  .rank-num {
    width:28px; height:28px; border-radius:9px;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:800; flex-shrink:0;
    background:var(--indigo-l); color:var(--indigo);
  }
  .rank-gold   { background:#fef9c3 !important; color:#92400e !important; }
  .rank-silver { background:#f1f5f9 !important; color:#334155 !important; }
  .rank-bronze { background:#fff7ed !important; color:#9a3412 !important; }
  .prod-name { font-size:12.5px; font-weight:700; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:52%; }
  .prod-rev  { font-size:11px; font-weight:600; color:var(--text-3); }
  .badge {
    display:inline-flex; align-items:center;
    font-size:10px; font-weight:800; letter-spacing:.04em;
    padding:2px 8px; border-radius:99px;
  }
  .prog-track { height:5px; border-radius:99px; background:rgba(0,0,0,.06); overflow:hidden; flex:1; }
  .prog-fill {
    height:100%; border-radius:99px;
    background:linear-gradient(90deg,var(--indigo),#818cf8,#34d399);
    background-size:200%;
    animation:shimmer 2.5s linear infinite, bar-in .7s ease both;
  }
  /* ─── ACTIVITY ───────────────────────── */
  .activity-item {
    border-radius:14px; background:var(--bg);
    border:1.5px solid var(--border); padding:12px 14px;
    display:flex; align-items:center; justify-content:space-between;
    transition:background .15s, border-color .15s;
  }
  .activity-item:hover { background:#fff; border-color:var(--border-s); }
  .tx-icon { width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .tx-id   { font-size:12.5px; font-weight:700; color:var(--text-1); }
  .tx-date { font-size:10.5px; color:var(--text-4); font-weight:500; margin-top:1px; }
  .tx-amount { font-size:1.05rem; letter-spacing:-.02em; }
`],
  template: `
    <div>

      <!-- ═══════ HEADER ═══════ -->
      <div class="hdr animate-in">
        <div class="hdr-left">
          <div class="hdr-icon">
            <lucide-icon [img]="Activity" style="width:24px;height:24px;color:#fff"></lucide-icon>
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap">
              <span class="hdr-title">Panel Principal</span>
              <span class="live-pill"><span class="live-dot"></span>En vivo</span>
            </div>
            <div class="hdr-sub">
              Vista general de operaciones ·
              <strong style="color:var(--text-2)">Legumbría La Bendición</strong>
            </div>
          </div>
        </div>
        <div class="hdr-date">
          <div class="hdr-date-lbl">Hoy</div>
          <div class="hdr-date-val">{{ today | date:'d MMM yyyy' }}</div>
        </div>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (stats()) {

        <!-- ═══════ STAT CARDS ═══════ -->
        <div class="stat-grid">
          @for (c of statCards(); track c.label; let i = $index) {
            <div class="stat-card animate-in" [class]="'s' + (i+1)">

              <!-- Decorative SVG: bubbles + lines unique per card -->
              <div class="card-bg-svg">
                <svg width="100%" height="100%" viewBox="0 0 200 150" preserveAspectRatio="xMaxYMin meet"
                  aria-hidden="true">
                  <circle [attr.cx]="175" [attr.cy]="20" r="55"
                    [attr.fill]="c.color + '11'"/>
                  <circle [attr.cx]="155" [attr.cy]="65" r="30"
                    [attr.fill]="c.color + '09'"/>
                  @if (i % 2 === 0) {
                    <line x1="0" y1="140" x2="200" y2="95"
                      [attr.stroke]="c.color + '10'" stroke-width="1"/>
                    <line x1="0" y1="120" x2="200" y2="75"
                      [attr.stroke]="c.color + '08'" stroke-width=".6"/>
                  } @else {
                    <polygon points="155,95 190,115 155,135 120,115"
                      [attr.fill]="c.color + '07'"/>
                  }
                  <circle cx="185" cy="133" r="6" [attr.fill]="c.color + '18'"/>
                  <circle cx="170" cy="144" r="3" [attr.fill]="c.color + '14'"/>
                </svg>
              </div>

              <!-- Top row: icon + sparkline bars -->
              <div class="card-top">
                <div class="card-icon" [style]="'background:' + c.color + '1a'">
                  @if (c.icon === 'truck') {
                    <lucide-icon [img]="Truck" style="width:20px;height:20px"
                      [style.color]="c.color"></lucide-icon>
                  }
                  @if (c.icon === 'package') {
                    <lucide-icon [img]="Package" style="width:20px;height:20px"
                      [style.color]="c.color"></lucide-icon>
                  }
                  @if (c.icon === 'receipt') {
                    <lucide-icon [img]="ReceiptText" style="width:20px;height:20px"
                      [style.color]="c.color"></lucide-icon>
                  }
                  @if (c.icon === 'dollar') {
                    <lucide-icon [img]="DollarSign" style="width:20px;height:20px"
                      [style.color]="c.color"></lucide-icon>
                  }
                </div>
                <!-- Sparkline mini bars -->
                <div class="sparkline-bars">
                  @for (h of c.spark; track $index; let last = $last) {
                    <div class="spark-bar"
                      [style]="'height:' + h + 'px;background:' + (last ? c.color : c.color + '55')">
                    </div>
                  }
                </div>
              </div>

              <!-- Big number -->
              <div class="card-value" [class.card-value-sm]="c.isLong" [style.color]="c.textColor">
                {{ c.value }}
              </div>

              <!-- Label + badge -->
              <div class="card-meta">
                <span class="card-label">{{ c.label }}</span>
                <span class="card-pct"
                  [style]="'background:' + c.color + '18;color:' + c.color">
                  <lucide-icon [img]="c.up ? TrendingUp : TrendingDown"
                    style="width:10px;height:10px"></lucide-icon>
                  {{ c.badge }}
                </span>
              </div>

              <!-- Bottom accent line -->
              <div class="card-bottom-line"
                [style]="'background:linear-gradient(90deg,transparent,' + c.color + '66,transparent)'">
              </div>
            </div>
          }
        </div>

        <!-- ═══════ METRIC ROW ═══════ -->
        <div class="metric-row">

          <!-- Ventas -->
          <div class="metric-card animate-in s1"
            style="background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);
              border:1.5px solid rgba(4,120,87,.18);box-shadow:0 4px 20px rgba(4,120,87,.1)">
            <div class="metric-top-line"
              style="background:linear-gradient(90deg,transparent,#047857,transparent)">
            </div>
            <div style="display:flex;align-items:center;gap:11px">
              <div class="metric-icon"
                style="background:rgba(4,120,87,.14);box-shadow:0 3px 10px rgba(4,120,87,.18)">
                <lucide-icon [img]="TrendingUp"
                  style="width:17px;height:17px;color:#047857"></lucide-icon>
              </div>
              <div>
                <div class="metric-lbl" style="color:#047857">Ventas Totales</div>
                <div class="metric-val" style="color:#065f46">{{ cop(stats()!.total_sales) }}</div>
              </div>
            </div>
          </div>

          <!-- Compras -->
          <div class="metric-card animate-in s2"
            style="background:linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%);
              border:1.5px solid rgba(67,56,202,.18);box-shadow:0 4px 20px rgba(67,56,202,.1)">
            <div class="metric-top-line"
              style="background:linear-gradient(90deg,transparent,#4338ca,transparent)">
            </div>
            <div style="display:flex;align-items:center;gap:11px">
              <div class="metric-icon"
                style="background:rgba(67,56,202,.12);box-shadow:0 3px 10px rgba(67,56,202,.18)">
                <lucide-icon [img]="ShoppingCart"
                  style="width:17px;height:17px;color:#4338ca"></lucide-icon>
              </div>
              <div>
                <div class="metric-lbl" style="color:#4338ca">Compras Totales</div>
                <div class="metric-val" style="color:#312e81">{{ cop(stats()!.total_purchases) }}</div>
              </div>
            </div>
          </div>

          <!-- Ganancia / Pérdida -->
          <div class="metric-card animate-in s3"
            [style]="stats()!.total_profit >= 0
              ? 'background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1.5px solid rgba(4,120,87,.18);box-shadow:0 4px 20px rgba(4,120,87,.1)'
              : 'background:linear-gradient(135deg,#fff1f2,#ffe4e6);border:1.5px solid rgba(190,18,60,.18);box-shadow:0 4px 20px rgba(190,18,60,.1)'">
            <div class="metric-top-line"
              [style]="stats()!.total_profit >= 0
                ? 'background:linear-gradient(90deg,transparent,#047857,transparent)'
                : 'background:linear-gradient(90deg,transparent,#be123c,transparent)'">
            </div>
            <div style="display:flex;align-items:center;gap:11px">
              <div class="metric-icon"
                [style]="stats()!.total_profit >= 0
                  ? 'background:rgba(4,120,87,.12);box-shadow:0 3px 10px rgba(4,120,87,.18)'
                  : 'background:rgba(190,18,60,.12);box-shadow:0 3px 10px rgba(190,18,60,.18)'">
                @if (stats()!.total_profit >= 0) {
                  <lucide-icon [img]="ArrowUpRight"
                    style="width:17px;height:17px;color:#047857"></lucide-icon>
                } @else {
                  <lucide-icon [img]="ArrowDownRight"
                    style="width:17px;height:17px;color:#be123c"></lucide-icon>
                }
              </div>
              <div>
                <div class="metric-lbl"
                  [style]="stats()!.total_profit >= 0 ? 'color:#047857' : 'color:#be123c'">
                  {{ stats()!.total_profit >= 0 ? 'Ganancia Neta' : 'Pérdida Neta' }}
                </div>
                <div class="metric-val"
                  [style]="stats()!.total_profit >= 0 ? 'color:#065f46' : 'color:#9f1239'">
                  {{ cop(stats()!.total_profit) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══════ CONTENT ═══════ -->
        <div class="content-grid">

          <!-- TOP PRODUCTS -->
          <div class="section-card animate-in s4">
            <div class="section-hdr">
              <div style="display:flex;align-items:center;gap:11px">
                <div class="section-icon"
                  style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);
                    border:1px solid rgba(4,120,87,.14)">
                  <lucide-icon [img]="BarChart3"
                    style="width:18px;height:18px;color:#047857"></lucide-icon>
                </div>
                <div>
                  <div class="section-title">Productos más vendidos</div>
                  <div class="section-sub">Ranking por unidades · todos los tiempos</div>
                </div>
              </div>
              <a routerLink="/transactions" class="view-btn">
                Ver todo
                <lucide-icon [img]="ArrowUpRight" style="width:12px;height:12px"></lucide-icon>
              </a>
            </div>
            <div class="section-divider"></div>

            @if (!stats()!.food_stats.length) {
              <div style="display:flex;flex-direction:column;align-items:center;
                justify-content:center;padding:56px 0">
                <lucide-icon [img]="Package"
                  style="width:40px;height:40px;opacity:.18;margin-bottom:12px;color:var(--text-3)">
                </lucide-icon>
                <p style="font-size:13px;font-weight:600;color:var(--text-4)">Sin datos aún</p>
              </div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:13px">
                @for (item of stats()!.food_stats.slice(0,6); track item.name; let i = $index) {
                  <div class="prod-item animate-in"
                    [style]="'animation-delay:' + (.28 + i*.06) + 's'">
                    <div class="rank-num"
                      [class.rank-gold]="i===0"
                      [class.rank-silver]="i===1"
                      [class.rank-bronze]="i===2">
                      {{ i + 1 }}
                    </div>
                    <div style="flex:1;min-width:0">
                      <div style="display:flex;justify-content:space-between;
                        align-items:center;margin-bottom:7px">
                        <span class="prod-name">{{ item.name }}</span>
                        <div style="display:flex;align-items:center;gap:6px">
                          <span class="prod-rev">{{ cop(item.revenue) }}</span>
                          <span class="badge"
                            style="background:rgba(4,120,87,.1);color:#047857">
                            {{ item.count }} uds
                          </span>
                        </div>
                      </div>
                      <div class="prog-track">
                        <div class="prog-fill"
                          [style.width.%]="barWidth(item.count)"
                          [style]="'animation-delay:' + (.4 + i*.07) + 's'">
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- RECENT ACTIVITY -->
          <div class="section-card animate-in s5">
            <div style="display:flex;align-items:center;gap:11px;margin-bottom:4px">
              <div class="section-icon"
                style="background:linear-gradient(135deg,#fffbeb,#fef3c7);
                  border:1px solid rgba(180,83,9,.14)">
                <lucide-icon [img]="Clock3"
                  style="width:18px;height:18px;color:#b45309"></lucide-icon>
              </div>
              <div>
                <div class="section-title">Actividad reciente</div>
                <div class="section-sub">Últimos movimientos registrados</div>
              </div>
            </div>
            <div class="section-divider"></div>

            @if (!stats()!.recent_transactions.length) {
              <p style="font-size:13px;text-align:center;padding:40px 0;
                color:var(--text-4);font-weight:500">
                Sin transacciones aún
              </p>
            } @else {
              <div style="display:flex;flex-direction:column;gap:8px">
                @for (tx of stats()!.recent_transactions; track tx.id; let i = $index) {
                  <div class="activity-item animate-in"
                    [style]="'animation-delay:' + (.32 + i*.05) + 's'">
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="tx-icon"
                        [style]="tx.transaction_type === 'sale'
                          ? 'background:linear-gradient(135deg,#ecfdf5,#d1fae5);box-shadow:0 2px 8px rgba(4,120,87,.14)'
                          : 'background:linear-gradient(135deg,#eef2ff,#e0e7ff);box-shadow:0 2px 8px rgba(67,56,202,.14)'">
                        @if (tx.transaction_type === 'sale') {
                          <lucide-icon [img]="ArrowUpRight"
                            style="width:15px;height:15px;color:#047857"></lucide-icon>
                        } @else {
                          <lucide-icon [img]="ArrowDownRight"
                            style="width:15px;height:15px;color:#4338ca"></lucide-icon>
                        }
                      </div>
                      <div>
                        <div style="display:flex;align-items:center;gap:6px">
                          <span class="tx-id">#{{ tx.id }}</span>
                          <span class="badge"
                            [style]="tx.transaction_type === 'sale'
                              ? 'background:rgba(4,120,87,.1);color:#047857'
                              : 'background:rgba(67,56,202,.1);color:#4338ca'">
                            {{ tx.transaction_type === 'sale' ? 'Venta' : 'Compra' }}
                          </span>
                        </div>
                        <div class="tx-date">{{ tx.created_at | date:'d MMM, h:mm a' }}</div>
                      </div>
                    </div>
                    <span class="tx-amount"
                      [style]="tx.transaction_type === 'sale'
                        ? 'color:#065f46'
                        : 'color:#312e81'">
                      {{ cop(tx.total) }}
                    </span>
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
  // Icons
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
  BarChart3 = BarChart3;
  Zap = Zap;

  today = new Date();

  private ds = inject(DashboardService);
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.ds.getStats().subscribe({
      next: (d) => { this.stats.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cop(n: number) { return COP(n); }

  statCards() {
    const s = this.stats()!;
    const profit = s.total_profit >= 0;
    return [
      {
        label: 'Proveedores activos',
        value: s.total_suppliers,
        icon: 'truck',
        color: '#4338ca',
        textColor: '#1e1b4b',
        badge: '+3',
        up: true,
        isLong: false,
        spark: [30, 50, 38, 70, 55, 80, 65, 92]
      },
      {
        label: 'Productos en catálogo',
        value: s.total_foods,
        icon: 'package',
        color: '#c2410c',
        textColor: '#7c2d12',
        badge: '+12',
        up: true,
        isLong: false,
        spark: [60, 42, 70, 55, 78, 65, 75, 88]
      },
      {
        label: 'Total transacciones',
        value: s.total_transactions,
        icon: 'receipt',
        color: '#047857',
        textColor: '#064e3b',
        badge: '+8%',
        up: true,
        isLong: false,
        spark: [40, 60, 48, 75, 60, 85, 70, 95]
      },
      {
        label: 'Ganancia neta',
        value: COP(s.total_profit),
        icon: 'dollar',
        color: profit ? '#047857' : '#be123c',
        textColor: profit ? '#064e3b' : '#881337',
        badge: profit ? '+14%' : '-5%',
        up: profit,
        isLong: true,
        spark: profit
          ? [55, 70, 60, 80, 65, 90, 75, 96]
          : [80, 65, 72, 55, 60, 45, 50, 38]
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