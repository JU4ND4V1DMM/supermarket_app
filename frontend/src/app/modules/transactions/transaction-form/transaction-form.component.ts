import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TransactionService, TransactionCreate } from '../../../core/services/transaction.service';
import { FoodService, Food } from '../../../core/services/food.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate('400ms cubic-bezier(.22,.68,0,1.2)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    <div @slideUp class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/transactions"
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          style="background:var(--surface-2);border:1.5px solid var(--border);color:var(--text-2);box-shadow:var(--shadow-sm)"
          onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
          onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text-2)'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </a>
        <div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-6 rounded-full" style="background:linear-gradient(180deg,var(--accent),var(--accent-2))"></div>
            <h1 class="text-2xl font-extrabold tracking-tight" style="color:var(--text-1)">Nueva Transacción</h1>
          </div>
          <p class="ml-3.5 text-sm mt-0.5" style="color:var(--text-3)">Registra una venta o compra con trazabilidad completa</p>
        </div>
      </div>

      <!-- Main card -->
      <div class="rounded-3xl p-8" style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-lg)">

        <!-- Tipo de transacción -->
        <div class="mb-7">
          <label class="block text-xs font-bold uppercase tracking-widest mb-3" style="color:var(--text-3)">Tipo de transacción</label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" (click)="form.transaction_type = 'sale'"
              class="relative py-4 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer overflow-hidden group"
              [style]="form.transaction_type === 'sale'
                ? 'background:rgba(16,185,129,0.08);border-color:#10b981;color:#059669;box-shadow:0 4px 20px rgba(16,185,129,0.15)'
                : 'background:var(--surface-3);border-color:var(--border);color:var(--text-3)'">
              <div class="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                Venta
              </div>
              @if (form.transaction_type === 'sale') {
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
              }
            </button>
            <button type="button" (click)="form.transaction_type = 'purchase'"
              class="relative py-4 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer overflow-hidden"
              [style]="form.transaction_type === 'purchase'
                ? 'background:rgba(99,102,241,0.08);border-color:#6366f1;color:#6366f1;box-shadow:0 4px 20px rgba(99,102,241,0.15)'
                : 'background:var(--surface-3);border-color:var(--border);color:var(--text-3)'">
              <div class="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                Compra
              </div>
              @if (form.transaction_type === 'purchase') {
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
              }
            </button>
          </div>
        </div>

        <!-- Producto -->
        <div class="mb-6">
          <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">Producto <span style="color:var(--accent)">*</span></label>
          <div class="relative">
            <select [(ngModel)]="form.food_id" (ngModelChange)="onFoodChange()" name="food_id" required
              class="inp w-full px-4 py-3 text-sm cursor-pointer pr-10 appearance-none"
              style="color:var(--text-1)">
              <option [value]="undefined" disabled style="color:var(--text-3)">Seleccionar producto…</option>
              @for (f of foods(); track f.id) {
                <option [value]="f.id">{{ f.name }} — {{ f.price | currency:'COP':'symbol-narrow':'1.0-0' }}</option>
              }
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color:var(--text-3)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <!-- Cantidad + Total -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">Cantidad <span style="color:var(--accent)">*</span></label>
            <input [(ngModel)]="form.quantity" (ngModelChange)="onQtyChange()" name="quantity"
              type="number" min="1" required placeholder="1"
              class="inp w-full px-4 py-3 text-sm"
              style="color:var(--text-1)"/>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">Total calculado</label>
            <div class="flex items-center px-4 py-3 rounded-xl text-sm font-extrabold stat-number"
              style="background:linear-gradient(135deg,rgba(14,165,233,0.06),rgba(14,165,233,0.02));border:1.5px solid rgba(14,165,233,0.2);color:var(--accent)">
              {{ computedTotal() | currency:'COP':'symbol-narrow':'1.0-0' }}
            </div>
          </div>
        </div>

        <!-- Trazabilidad -->
        <div class="rounded-2xl p-5 mb-6" style="background:linear-gradient(135deg,rgba(245,158,11,0.04),rgba(245,158,11,0.01));border:1.5px solid rgba(245,158,11,0.15)">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:rgba(245,158,11,0.12)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:var(--accent-2)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div>
              <p class="text-sm font-bold" style="color:var(--text-1)">Información de trazabilidad</p>
              <p class="text-xs" style="color:var(--text-3)">Opcional — recomendado para auditorías</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-2)">Número de lote</label>
              <input [(ngModel)]="form.batch_number" name="batch_number" placeholder="Ej: LOTE-2024-001"
                class="inp w-full px-4 py-2.5 text-sm"
                style="color:var(--text-1)"/>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1.5" style="color:var(--text-2)">Origen del producto</label>
              <input [(ngModel)]="form.origin" name="origin" placeholder="Ej: Colombia, Valle del Cauca"
                class="inp w-full px-4 py-2.5 text-sm"
                style="color:var(--text-1)"/>
            </div>
          </div>
        </div>

        <!-- Cliente -->
        <div class="mb-8">
          <label class="block text-xs font-bold uppercase tracking-widest mb-3" style="color:var(--text-3)">Cliente</label>
          <div class="flex gap-3 mb-3">
            <label class="flex items-center gap-2 cursor-pointer group">
              <div class="relative">
                <input type="radio" [(ngModel)]="form.is_anonymous" [value]="true" name="anon" class="sr-only"/>
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  [style]="form.is_anonymous ? 'border-color:var(--accent);background:var(--accent)' : 'border-color:var(--border)'">
                  @if (form.is_anonymous) {
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                  }
                </div>
              </div>
              <span class="text-sm font-medium" style="color:var(--text-1)">Anónimo</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <div class="relative">
                <input type="radio" [(ngModel)]="form.is_anonymous" [value]="false" name="anon" class="sr-only"/>
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  [style]="!form.is_anonymous ? 'border-color:var(--accent);background:var(--accent)' : 'border-color:var(--border)'">
                  @if (!form.is_anonymous) {
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                  }
                </div>
              </div>
              <span class="text-sm font-medium" style="color:var(--text-1)">Cliente registrado</span>
            </label>
          </div>
          @if (!form.is_anonymous) {
            <div class="relative">
              <select [(ngModel)]="form.customer_id" name="customer_id"
                class="inp w-full px-4 py-3 text-sm cursor-pointer pr-10 appearance-none"
                style="color:var(--text-1)">
                <option [value]="undefined" disabled>Seleccionar cliente…</option>
                @for (u of users(); track u.id) {
                  <option [value]="u.id">{{ u.full_name }} ({{ u.email }})</option>
                }
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color:var(--text-3)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          }
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <a routerLink="/transactions"
            class="flex-1 py-3 text-center rounded-2xl text-sm font-semibold transition-all cursor-pointer"
            style="background:var(--surface-3);color:var(--text-2);border:1.5px solid var(--border)"
            onmouseenter="this.style.borderColor='var(--text-3)'"
            onmouseleave="this.style.borderColor='var(--border)'">
            Cancelar
          </a>
          <button type="button" (click)="onSubmit()" [disabled]="saving()"
            class="flex-1 py-3 rounded-2xl text-sm font-bold text-white btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:transform-none">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Guardando…
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Crear Transacción
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TransactionFormComponent implements OnInit {
  private txSvc = inject(TransactionService);
  private foodSvc = inject(FoodService);
  private userSvc = inject(UserService);
  private toast = inject(ToastService);
  private router = inject(Router);

  foods = signal<Food[]>([]);
  users = signal<User[]>([]);
  saving = signal(false);
  selectedFood = signal<Food | null>(null);

  form: TransactionCreate & { quantity: number } = {
    food_id: undefined as any,
    quantity: 1,
    transaction_type: 'sale',
    is_anonymous: true,
    customer_id: undefined,
    batch_number: '',
    origin: '',
  };

  computedTotal = computed(() => {
    const food = this.selectedFood();
    return food ? food.price * (this.form.quantity || 0) : 0;
  });

  ngOnInit() {
    this.foodSvc.getAllNoPagination().subscribe((foods) => this.foods.set(foods));
    this.userSvc.getAll().subscribe((users) => this.users.set(users));
  }

  onFoodChange() {
    const food = this.foods().find((f) => f.id == this.form.food_id) ?? null;
    this.selectedFood.set(food);
  }

  onQtyChange() {}

  onSubmit() {
    if (!this.form.food_id || !this.form.quantity) return;
    this.saving.set(true);
    this.txSvc.create(this.form).subscribe({
      next: (tx) => {
        this.toast.success('¡Transacción creada con éxito!');
        this.router.navigate(['/transactions', tx.id]);
      },
      error: (err) => {
        this.toast.error(err.error?.detail ?? 'Error al crear la transacción.');
        this.saving.set(false);
      },
    });
  }
}
