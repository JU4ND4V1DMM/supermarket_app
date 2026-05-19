import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TransactionService, TransactionCreate } from '../../../core/services/transaction.service';
import { FoodService, Food } from '../../../core/services/food.service';
import { ToastService } from '../../../core/services/toast.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { trigger, transition, style, animate } from '@angular/animations';

const COP = (n: number) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);

interface CartItem { food: Food; quantity: number; }

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DropdownModule, InputNumberModule],
  animations: [
    trigger('slideUp', [transition(':enter', [style({ opacity:0, transform:'translateY(24px)' }), animate('400ms cubic-bezier(.22,.68,0,1.2)', style({ opacity:1, transform:'translateY(0)' }))])]),
    trigger('rowIn', [
      transition(':enter', [style({ opacity:0, transform:'translateX(-12px)' }), animate('220ms ease-out', style({ opacity:1, transform:'translateX(0)' }))]),
      transition(':leave', [animate('180ms ease-in', style({ opacity:0, transform:'translateX(12px)' }))]),
    ]),
  ],
  template: `
    <div @slideUp class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/transactions"
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          style="background:#ffffff;border:1.5px solid var(--border);color:var(--text-4);box-shadow:var(--shadow-sm)"
          onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
          onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text-4)'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </a>
        <div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-7 rounded-full" style="background:linear-gradient(180deg,#6366f1,#f59e0b)"></div>
            <h1 class="text-2xl font-extrabold tracking-tight" style="color:var(--text-1)">Nueva Transacción</h1>
          </div>
          <p class="ml-3.5 text-sm mt-0.5" style="color:var(--text-4)">Agrega varios productos · tipo carrito de vendedor</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- LEFT: Form -->
        <div class="lg:col-span-3 space-y-5">

          <!-- Tipo -->
          <div class="rounded-2xl p-5" style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">
            <label class="block text-xs font-bold uppercase tracking-widest mb-3" style="color:var(--text-4)">Tipo de transacción</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" (click)="txType.set('sale')"
                class="relative py-4 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer overflow-hidden"
                [style]="txType()==='sale'
                  ? 'background:rgba(16,185,129,0.08);border-color:#10b981;color:#059669;box-shadow:0 4px 20px rgba(16,185,129,0.18)'
                  : 'background:var(--surface-3);border-color:var(--border);color:var(--text-4)'">
                <div class="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  Venta
                </div>
                @if (txType()==='sale') { <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div> }
              </button>
              <button type="button" (click)="txType.set('purchase')"
                class="relative py-4 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer overflow-hidden"
                [style]="txType()==='purchase'
                  ? 'background:rgba(99,102,241,0.08);border-color:#6366f1;color:#6366f1;box-shadow:0 4px 20px rgba(99,102,241,0.18)'
                  : 'background:var(--surface-3);border-color:var(--border);color:var(--text-4)'">
                <div class="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                  Compra
                </div>
                @if (txType()==='purchase') { <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div> }
              </button>
            </div>
          </div>

          <!-- Add product -->
          <div class="rounded-2xl p-5" style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">
            <label class="block text-xs font-bold uppercase tracking-widest mb-3" style="color:var(--text-4)">Agregar producto al carrito</label>
            <div class="flex gap-2 items-end">
              <div class="flex-1">
                <p-dropdown [options]="foodOptions()" [(ngModel)]="selectedFoodId" name="food_select"
                  optionLabel="label" optionValue="value"
                  placeholder="Seleccionar producto…"
                  styleClass="w-full" appendTo="body" [filter]="true" filterPlaceholder="Buscar…">
                  <ng-template pTemplate="selectedItem" let-opt>
                    <div class="flex items-center justify-between gap-2" *ngIf="opt">
                      <span class="font-semibold text-sm" style="color:var(--text-1)">{{ opt.label }}</span>
                      <span class="text-xs font-bold" [style]="txType()==='sale' ? 'color:#059669' : 'color:#6366f1'">
                        {{ cop(opt.price) }}
                      </span>
                    </div>
                  </ng-template>
                  <ng-template pTemplate="item" let-opt>
                    <div class="flex items-center justify-between gap-2 py-0.5">
                      <span class="text-sm font-semibold" style="color:var(--text-1)">{{ opt.label }}</span>
                      <div class="flex flex-col items-end text-xs gap-0.5">
                        <span style="color:#059669">Venta: {{ cop(opt.sale_price) }}</span>
                        <span style="color:#6366f1">Compra: {{ cop(opt.purchase_price) }}</span>
                      </div>
                    </div>
                  </ng-template>
                </p-dropdown>
              </div>
              <div class="w-24">
                <p-inputNumber [(ngModel)]="selectedQty" name="qty" [min]="1" [max]="9999"
                  inputStyleClass="inp w-full px-3 py-2.5 text-sm text-center" [showButtons]="false">
                </p-inputNumber>
              </div>
              <button type="button" (click)="addToCart()"
                class="btn-primary px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer flex-shrink-0 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar
              </button>
            </div>

            <!-- Cart items -->
            @if (cart().length > 0) {
              <div class="mt-4 rounded-xl overflow-hidden" style="border:1.5px solid var(--border)">
                @for (item of cart(); track item.food.id) {
                  <div @rowIn class="flex items-center gap-3 px-4 py-3" style="border-bottom:1px solid var(--border)">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.15)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#f97316" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold truncate" style="color:var(--text-1)">{{ item.food.name }}</p>
                      <p class="text-xs mt-0.5" style="color:var(--text-4)">
                        {{ cop(unitPrice(item.food)) }} × {{ item.quantity }}
                        = <span class="font-bold" style="color:var(--accent)">{{ cop(unitPrice(item.food) * item.quantity) }}</span>
                      </p>
                    </div>
                    <!-- Qty controls -->
                    <div class="flex items-center gap-1.5">
                      <button type="button" (click)="changeQty(item,-1)"
                        class="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                        style="background:var(--surface-3);color:var(--text-4)"
                        onmouseenter="this.style.background='rgba(244,63,94,0.1)';this.style.color='#e11d48'"
                        onmouseleave="this.style.background='var(--surface-3)';this.style.color='var(--text-4)'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span class="text-sm font-bold w-6 text-center" style="color:var(--text-1)">{{ item.quantity }}</span>
                      <button type="button" (click)="changeQty(item,1)"
                        class="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                        style="background:var(--surface-3);color:var(--text-4)"
                        onmouseenter="this.style.background='rgba(16,185,129,0.1)';this.style.color='#059669'"
                        onmouseleave="this.style.background='var(--surface-3)';this.style.color='var(--text-4)'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <button type="button" (click)="removeItem(item)"
                        class="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ml-1"
                        style="color:var(--text-4)"
                        onmouseenter="this.style.background='rgba(244,63,94,0.1)';this.style.color='#e11d48'"
                        onmouseleave="this.style.background='transparent';this.style.color='var(--text-4)'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Trazabilidad -->
          <div class="rounded-2xl p-5" style="background:#ffffff;border:1.5px solid rgba(245,158,11,0.2);box-shadow:var(--shadow-sm)">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:rgba(245,158,11,0.12)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" style="color:#d97706" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div>
                <p class="text-sm font-bold" style="color:var(--text-1)">Trazabilidad</p>
                <p class="text-xs" style="color:var(--text-4)">Opcional — recomendado para auditorías</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-4)">N° de lote</label>
                <input [(ngModel)]="batchNumber" name="batch" placeholder="LOT-001" class="inp w-full px-3 py-2.5 text-sm"/>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-4)">Origen</label>
                <input [(ngModel)]="origin" name="origin" placeholder="Bogotá, CO" class="inp w-full px-3 py-2.5 text-sm"/>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-4)">Notas</label>
              <input [(ngModel)]="notes" name="notes" placeholder="Observaciones…" class="inp w-full px-3 py-2.5 text-sm"/>
            </div>
          </div>

          <!-- Submit -->
          <button type="button" (click)="submit()" [disabled]="saving() || !cart().length"
            class="btn-primary w-full py-3.5 rounded-2xl text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              Guardando…
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Emitir transacción ({{ cart().length }} producto{{ cart().length !== 1 ? 's' : '' }})
            }
          </button>
        </div>

        <!-- RIGHT: Summary -->
        <div class="lg:col-span-2">
          <div class="rounded-2xl p-6 sticky top-6" style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-lg)">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background:rgba(99,102,241,0.10);border:1px solid rgba(99,102,241,0.2)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--accent)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <h2 class="font-bold text-sm" style="color:var(--text-1)">Resumen de transacción</h2>
            </div>

            @if (!cart().length) {
              <div class="flex flex-col items-center py-10 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mb-3 opacity-20" style="color:var(--text-4)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <p class="text-sm font-medium" style="color:var(--text-4)">El carrito está vacío</p>
              </div>
            } @else {
              <!-- Items summary -->
              <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
                @for (item of cart(); track item.food.id) {
                  <div class="flex justify-between items-center text-sm py-1.5 border-b" style="border-color:var(--border)">
                    <div class="min-w-0 mr-2">
                      <p class="truncate font-semibold" style="color:var(--text-1)">{{ item.food.name }}</p>
                      <p class="text-xs" style="color:var(--text-4)">{{ cop(unitPrice(item.food)) }} × {{ item.quantity }}</p>
                    </div>
                    <span class="font-bold flex-shrink-0" style="color:var(--text-1)">{{ cop(unitPrice(item.food) * item.quantity) }}</span>
                  </div>
                }
              </div>

              <!-- Total -->
              <div class="pt-3" style="border-top:2px solid var(--border)">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-bold" style="color:var(--text-4)">Total a {{ txType() === 'sale' ? 'cobrar' : 'pagar' }}</span>
                </div>
                <p class="text-3xl font-black stat-number"
                  [style]="txType()==='sale' ? 'color:#059669' : 'color:#6366f1'">
                  {{ cop(grandTotal()) }}
                </p>
                <p class="text-xs mt-1" style="color:var(--text-4)">{{ cart().length }} producto(s) · valores en COP</p>
              </div>

              <!-- Tipo badge -->
              <div class="mt-4 flex justify-center">
                <span class="px-4 py-1.5 rounded-full text-xs font-bold"
                  [style]="txType()==='sale'
                    ? 'background:rgba(16,185,129,0.1);color:#059669;border:1.5px solid rgba(16,185,129,0.25)'
                    : 'background:rgba(99,102,241,0.1);color:#6366f1;border:1.5px solid rgba(99,102,241,0.25)'">
                  {{ txType()==='sale' ? '↑ VENTA' : '↓ COMPRA' }}
                </span>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
})
export class TransactionFormComponent implements OnInit {
  private txSvc = inject(TransactionService);
  private foodSvc = inject(FoodService);
  private toast = inject(ToastService);
  private router = inject(Router);

  foods = signal<Food[]>([]);
  saving = signal(false);
  txType = signal<'sale'|'purchase'>('sale');
  cart = signal<CartItem[]>([]);
  selectedFoodId: number | null = null;
  selectedQty = 1;
  batchNumber = ''; origin = ''; notes = '';

  ngOnInit() { this.foodSvc.getAllNoPagination().subscribe(f => this.foods.set(f)); }

  foodOptions() {
    return this.foods().map(f => ({
      label: f.name, value: f.id,
      price: this.txType() === 'sale' ? f.sale_price : f.purchase_price,
      sale_price: f.sale_price, purchase_price: f.purchase_price,
    }));
  }

  unitPrice(food: Food) { return this.txType() === 'sale' ? food.sale_price : food.purchase_price; }
  grandTotal() { return this.cart().reduce((s, i) => s + this.unitPrice(i.food) * i.quantity, 0); }
  cop(n: number) { return COP(n); }

  addToCart() {
    if (!this.selectedFoodId || this.selectedQty < 1) return;
    const food = this.foods().find(f => f.id === this.selectedFoodId);
    if (!food) return;
    const existing = this.cart().find(c => c.food.id === food.id);
    if (existing) { existing.quantity += this.selectedQty; this.cart.set([...this.cart()]); }
    else { this.cart.set([...this.cart(), { food, quantity: this.selectedQty }]); }
    this.selectedFoodId = null; this.selectedQty = 1;
  }

  changeQty(item: CartItem, delta: number) {
    item.quantity += delta;
    if (item.quantity <= 0) this.cart.set(this.cart().filter(c => c !== item));
    else this.cart.set([...this.cart()]);
  }

  removeItem(item: CartItem) { this.cart.set(this.cart().filter(c => c !== item)); }

  submit() {
    if (!this.cart().length) return;
    this.saving.set(true);
    const payload: TransactionCreate = {
      transaction_type: this.txType(),
      items: this.cart().map(c => ({ food_id: c.food.id, quantity: c.quantity })),
      batch_number: this.batchNumber || undefined,
      origin: this.origin || undefined,
      notes: this.notes || undefined,
      is_anonymous: true,
    };
    this.txSvc.create(payload).subscribe({
      next: (tx) => { this.toast.success(`Transacción #${tx.id} creada · ${COP(tx.total)}`); this.router.navigate(['/transactions', tx.id]); },
      error: (e) => { this.toast.error(e.error?.detail ?? 'Error al guardar'); this.saving.set(false); },
    });
  }
}
