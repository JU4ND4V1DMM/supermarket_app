import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

const COP = (n: number) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, DatePipe],
  animations: [
    trigger('fadeUp', [transition(':enter', [style({ opacity:0, transform:'translateY(18px)' }), animate('420ms cubic-bezier(.22,.68,0,1.2)', style({ opacity:1, transform:'translateY(0)' }))])]),
    trigger('staggerList', [transition('* => *', [query(':enter', [style({ opacity:0, transform:'translateX(-14px)' }), stagger(60, [animate('280ms ease-out', style({ opacity:1, transform:'translateX(0)' }))])], { optional:true })])]),
  ],
  template: `
    <div class="h-full flex flex-col" style="color:var(--text-1)">
      <!-- Back header -->
      <div class="flex items-center gap-4 mb-6 flex-shrink-0">
        <button (click)="goBack()"
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
          style="background:#ffffff;border:1.5px solid var(--border);color:var(--text-4);box-shadow:var(--shadow-sm)"
          onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
          onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text-4)'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-6 rounded-full" style="background:linear-gradient(180deg,#6366f1,#f472b6)"></div>
            <h1 class="text-xl font-extrabold tracking-tight" style="color:var(--text-1)">Detalle de Transacción</h1>
          </div>
          <p class="ml-3.5 text-xs mt-0.5" style="color:var(--text-4)">Factura · Trazabilidad · QR</p>
        </div>
      </div>

      @if (loading()) { <div class="flex-1 flex items-center justify-center"><app-spinner /></div> }
      @else if (tx()) {
        <div @fadeUp class="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">

          <!-- LEFT (3/5) -->
          <div class="lg:col-span-3 flex flex-col gap-4 min-h-0">

            <!-- Hero -->
            <div class="rounded-3xl p-6 relative overflow-hidden flex-shrink-0"
              style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-lg)">
              <div class="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
                [style]="tx()!.transaction_type==='sale' ? 'background:rgba(16,185,129,0.08);filter:blur(20px)' : 'background:rgba(99,102,241,0.08);filter:blur(20px)'"></div>

              <div class="relative z-10">
                <div class="flex items-start justify-between mb-5">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      [style]="tx()!.transaction_type==='sale'
                        ? 'background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05));border:1.5px solid rgba(16,185,129,0.3)'
                        : 'background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05));border:1.5px solid rgba(99,102,241,0.3)'">
                      @if (tx()!.transaction_type==='sale') {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" style="color:#059669" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" style="color:#6366f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                      }
                    </div>
                    <div>
                      <p class="text-2xl font-black stat-number" style="color:var(--text-1)">#{{ tx()!.id }}</p>
                      <span class="text-xs px-2.5 py-1 rounded-lg font-bold"
                        [class]="tx()!.transaction_type==='sale' ? 'badge-sale' : 'badge-purchase'">
                        {{ tx()!.transaction_type==='sale' ? '↑ Venta' : '↓ Compra' }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-black stat-number"
                      [style]="tx()!.transaction_type==='sale' ? 'color:#059669' : 'color:#6366f1'">
                      {{ cop(tx()!.total) }}
                    </p>
                    <p class="text-xs mt-1 font-medium" style="color:var(--text-4)">{{ tx()!.created_at | date:'d MMM yyyy, h:mm a' }}</p>
                  </div>
                </div>

                <!-- Summary chips -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-3 rounded-xl text-center" style="background:var(--surface-3);border:1px solid var(--border)">
                    <p class="text-xs font-bold uppercase tracking-wider mb-1" style="color:var(--text-4)">Productos</p>
                    <p class="text-lg font-black stat-number" style="color:var(--text-1)">{{ tx()!.items.length }}</p>
                  </div>
                  <div class="p-3 rounded-xl text-center" style="background:var(--surface-3);border:1px solid var(--border)">
                    <p class="text-xs font-bold uppercase tracking-wider mb-1" style="color:var(--text-4)">Unidades</p>
                    <p class="text-lg font-black stat-number" style="color:var(--text-1)">{{ totalUnits() }}</p>
                  </div>
                  <div class="p-3 rounded-xl text-center" style="background:var(--surface-3);border:1px solid var(--border)">
                    <p class="text-xs font-bold uppercase tracking-wider mb-1" style="color:var(--text-4)">Cliente</p>
                    <p class="text-sm font-bold truncate" style="color:var(--text-1)">{{ tx()!.is_anonymous ? 'Anónimo' : (tx()!.customer?.full_name ?? '—') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items table -->
            <div class="rounded-3xl overflow-hidden flex-shrink-0"
              style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-md)">
              <div class="px-5 py-4" style="border-bottom:1.5px solid var(--border);background:var(--surface-3)">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:rgba(249,115,22,0.12)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#f97316" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8"/></svg>
                  </div>
                  <h2 class="font-bold text-sm" style="color:var(--text-1)">Productos incluidos</h2>
                </div>
              </div>
              <table class="w-full">
                <thead>
                  <tr style="border-bottom:1px solid var(--border)">
                    <th class="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">Producto</th>
                    <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">Precio unit.</th>
                    <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">Cant.</th>
                    <th class="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">Subtotal</th>
                  </tr>
                </thead>
                <tbody [@staggerList]="tx()!.items.length">
                  @for (item of tx()!.items; track item.id) {
                    <tr style="border-bottom:1px solid var(--border);transition:background 0.15s"
                      onmouseenter="this.style.background='rgba(99,102,241,0.02)'" onmouseleave="this.style.background=''">
                      <td class="px-5 py-3.5">
                        <div class="flex items-center gap-2.5">
                          <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.15)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#f97316" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8"/></svg>
                          </div>
                          <div>
                            <p class="text-sm font-semibold" style="color:var(--text-1)">{{ item.food?.name ?? '—' }}</p>
                            <p class="text-xs" style="color:var(--text-4)">{{ item.food?.supplier?.name ?? '' }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-5 py-3.5 text-right text-sm font-semibold stat-number" style="color:var(--text-2)">{{ cop(item.unit_price) }}</td>
                      <td class="px-5 py-3.5 text-right text-sm font-bold" style="color:var(--text-1)">{{ item.quantity }}</td>
                      <td class="px-5 py-3.5 text-right text-sm font-black stat-number"
                        [style]="tx()!.transaction_type==='sale' ? 'color:#059669' : 'color:#6366f1'">
                        {{ cop(item.subtotal) }}
                      </td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr style="border-top:2px solid var(--border);background:var(--surface-3)">
                    <td colspan="3" class="px-5 py-3.5 text-sm font-bold" style="color:var(--text-4)">TOTAL</td>
                    <td class="px-5 py-3.5 text-right text-xl font-black stat-number"
                      [style]="tx()!.transaction_type==='sale' ? 'color:#059669' : 'color:#6366f1'">
                      {{ cop(tx()!.total) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Trazabilidad chain -->
            <div class="rounded-3xl p-5" style="background:#ffffff;border:1.5px solid rgba(245,158,11,0.2);box-shadow:var(--shadow-md)">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:rgba(245,158,11,0.12)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#d97706" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/></svg>
                </div>
                <h2 class="font-bold text-sm" style="color:var(--text-1)">Cadena de Trazabilidad</h2>
              </div>
              <div class="space-y-0" [@staggerList]="tx()">
                @for (step of traceSteps(); track step.label; let last = $last) {
                  <div class="flex gap-3" [class.mb-0]="last">
                    <div class="flex flex-col items-center">
                      <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        [style]="step.value ? 'background:rgba(16,185,129,0.1);border:1.5px solid rgba(16,185,129,0.3)' : 'background:var(--surface-3);border:1.5px solid var(--border)'">
                        @if (step.value) {
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" style="color:#059669" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        } @else {
                          <div class="w-2 h-2 rounded-full" style="background:var(--text-4)"></div>
                        }
                      </div>
                      @if (!last) { <div class="w-px flex-1 my-1" [style]="step.value ? 'background:rgba(16,185,129,0.2)' : 'background:var(--border)'"></div> }
                    </div>
                    <div class="pb-3 pt-0.5 flex-1">
                      <p class="text-xs font-bold uppercase tracking-wider" style="color:var(--text-4)">{{ step.label }}</p>
                      @if (step.value) { <p class="text-sm font-semibold mt-0.5" style="color:var(--text-1)">{{ step.value }}</p> }
                      @else { <p class="text-xs mt-0.5" style="color:var(--text-4)">No registrado</p> }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- RIGHT (2/5) -->
          <div class="lg:col-span-2 flex flex-col gap-4">

            <!-- QR Card -->
            <div class="rounded-3xl p-6 relative overflow-hidden"
              style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-lg)">
              <div class="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none animate-spin-slow"
                style="border:1.5px dashed rgba(99,102,241,0.12)"></div>
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style="background:rgba(99,102,241,0.10);border:1.5px solid rgba(99,102,241,0.2)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--accent)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                  </div>
                  <div>
                    <h2 class="font-bold text-sm" style="color:var(--text-1)">QR de Trazabilidad</h2>
                    <p class="text-xs" style="color:var(--text-4)">Escaneable sin iniciar sesión</p>
                  </div>
                </div>
                <div class="flex justify-center mb-4">
                  <div class="qr-wrapper relative">
                    <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                      style="background:linear-gradient(135deg,#6366f1,#818cf8);box-shadow:0 3px 12px rgba(99,102,241,0.4);border:2px solid white">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <canvas #qrCanvas width="180" height="180" class="block rounded-xl" style="image-rendering:pixelated"></canvas>
                  </div>
                </div>
                <div class="flex items-center gap-2 p-2.5 rounded-xl mb-4"
                  style="background:var(--surface-3);border:1px solid var(--border)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" style="color:var(--accent)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <p class="font-mono text-xs truncate" style="color:var(--text-2)">{{ qrUrl() }}</p>
                </div>
                <div class="flex gap-2">
                  <button (click)="downloadQR()"
                    class="flex-1 btn-primary flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Descargar
                  </button>
                  <button (click)="copyUrl()"
                    class="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    style="background:var(--surface-3);color:var(--text-2);border:1.5px solid var(--border)"
                    onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
                    onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text-2)'">
                    @if (copied()) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#059669" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    }
                    {{ copied() ? '¡Copiado!' : 'URL' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Total highlight card -->
            <div class="rounded-3xl p-5" style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-md)">
              <p class="text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">Total {{ tx()!.transaction_type==='sale' ? 'a cobrar' : 'a pagar' }}</p>
              <p class="text-3xl font-black stat-number mb-2"
                [style]="tx()!.transaction_type==='sale' ? 'color:#059669' : 'color:#6366f1'">
                {{ cop(tx()!.total) }}
              </p>
              <p class="text-xs" style="color:var(--text-4)">{{ tx()!.items.length }} producto(s) · {{ totalUnits() }} unidades · valores en COP</p>
              @if (tx()!.notes) {
                <div class="mt-3 p-3 rounded-xl" style="background:var(--surface-3);border:1px solid var(--border)">
                  <p class="text-xs font-bold mb-1" style="color:var(--text-4)">Notas</p>
                  <p class="text-sm" style="color:var(--text-1)">{{ tx()!.notes }}</p>
                </div>
              }
            </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class TransactionDetailComponent implements OnInit {
  private txSvc = inject(TransactionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  tx = signal<Transaction|null>(null);
  loading = signal(true); copied = signal(false); qrUrl = signal('');

  goBack() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/transactions']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.txSvc.getOne(id).subscribe({
      next:(t)=>{ this.tx.set(t); this.loading.set(false); const url=`${window.location.origin}/transactions/${t.id}`; this.qrUrl.set(url); setTimeout(()=>this.drawQR(url), 50); },
      error:()=>this.loading.set(false),
    });
  }

  totalUnits() { return this.tx()?.items.reduce((s,i)=>s+i.quantity,0) ?? 0; }
  cop(n: number) { return COP(n); }

  drawQR(text: string) {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const img = new Image(); img.crossOrigin='anonymous';
    img.src=`https://api.qrserver.com/v1/create-qr-code/?size=${W}x${W}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=1e1b4b&ecc=M&format=png`;
    img.onload=()=>{ ctx.drawImage(img,0,0,W,W); };
    img.onerror=()=>{ ctx.fillStyle='#f5f3ff'; ctx.fillRect(0,0,W,W); ctx.fillStyle='#6366f1'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText('QR no disponible',W/2,W/2); };
  }

  downloadQR() {
    const canvas=document.querySelector('canvas') as HTMLCanvasElement; if(!canvas) return;
    const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download=`qr-tx-${this.tx()?.id}.png`; a.click();
  }

  copyUrl() {
    navigator.clipboard.writeText(this.qrUrl()).then(()=>{ this.copied.set(true); setTimeout(()=>this.copied.set(false),2000); });
  }

  traceSteps() {
    const t = this.tx()!;
    return [
      { label:'Origen', value:t.origin },
      { label:'Número de lote', value:t.batch_number },
      { label:'Fecha', value:new Date(t.created_at).toLocaleString('es-CO') },
      { label:'Cliente', value:t.is_anonymous ? 'Anónimo' : t.customer?.full_name },
      { label:'Notas', value:t.notes },
    ];
  }
}
