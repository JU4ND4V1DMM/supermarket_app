import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodService, Food } from '../../../core/services/food.service';
import { SupplierService, Supplier } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-foods-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, PaginationComponent, ConfirmDialogComponent, SpinnerComponent],
  animations: [
    trigger('fadeUp', [transition(':enter', [style({ opacity: 0, transform: 'translateY(12px)' }), animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])]),
    trigger('modal', [transition(':enter', [style({ opacity: 0 }), animate('150ms', style({ opacity: 1 }))]), transition(':leave', [animate('150ms', style({ opacity: 0 }))])]),
  ],
  template: `
    <div @fadeUp style="color:var(--text-1)">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-6 rounded-full" style="background:linear-gradient(180deg,#0ea5e9,#6366f1)"></div>
            <h1 class="text-2xl font-extrabold tracking-tight" style="color:var(--text-1)">Productos</h1>
          </div>
          <p class="ml-3.5 text-sm" style="color:var(--text-3)">Catálogo de alimentos y precios</p>
        </div>
        <button (click)="openCreate()"
          class="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo producto
        </button>
      </div>

      <!-- Search -->
      <div class="mb-5">
        <div class="relative max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color:var(--text-3)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Buscar producto..."
            class="inp w-full pl-10 pr-4 py-2.5 text-sm" style="color:var(--text-1)"/>
        </div>
      </div>

      <!-- Table card -->
      <div class="rounded-2xl overflow-hidden"
        style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">

        @if (loading()) { <app-spinner /> }
        @else if (foods().length === 0) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
              style="background:rgba(251,146,60,0.07);border:1.5px solid rgba(251,146,60,0.15)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" style="color:#ea580c" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <p class="font-semibold" style="color:var(--text-1)">Sin productos</p>
            <p class="text-sm mt-1" style="color:var(--text-3)">Agrega tu primer producto al catálogo</p>
            <button (click)="openCreate()" class="mt-5 btn-primary px-5 py-2 rounded-xl text-sm font-bold cursor-pointer">
              + Nuevo producto
            </button>
          </div>
        }
        @else {
          <table class="w-full">
            <thead>
              <tr style="border-bottom:1.5px solid var(--border);background:var(--surface-3)">
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest" style="color:var(--text-3)">Producto</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest hidden sm:table-cell" style="color:var(--text-3)">Proveedor</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest" style="color:var(--text-3)">Precio</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest hidden lg:table-cell" style="color:var(--text-3)">Registrado</th>
                <th class="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-widest" style="color:var(--text-3)">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (f of foods(); track f.id) {
                <tr class="transition-colors" style="border-bottom:1px solid var(--border)"
                  onmouseenter="this.style.background='rgba(14,165,233,0.03)'"
                  onmouseleave="this.style.background=''">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style="background:linear-gradient(135deg,rgba(251,146,60,0.14),rgba(251,146,60,0.04));border:1.5px solid rgba(251,146,60,0.18)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:#ea580c" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </div>
                      <span class="text-sm font-semibold" style="color:var(--text-1)">{{ f.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 hidden sm:table-cell">
                    <span class="text-xs px-2.5 py-1 rounded-lg font-semibold"
                      style="background:rgba(99,102,241,0.08);color:#4338ca;border:1px solid rgba(99,102,241,0.18)">
                      {{ f.supplier?.name ?? '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-black stat-number" style="color:#059669">
                      {{ f.price | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm hidden lg:table-cell" style="color:var(--text-3)">
                    {{ f.created_at | date:'d MMM yyyy' }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 justify-end">
                      <button (click)="openEdit(f)" title="Editar"
                        class="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        style="color:var(--text-3)"
                        onmouseenter="this.style.background='rgba(14,165,233,0.10)';this.style.color='var(--accent)'"
                        onmouseleave="this.style.background='transparent';this.style.color='var(--text-3)'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button (click)="confirmDelete(f)" title="Eliminar"
                        class="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        style="color:var(--text-3)"
                        onmouseenter="this.style.background='rgba(239,68,68,0.10)';this.style.color='#dc2626'"
                        onmouseleave="this.style.background='transparent';this.style.color='var(--text-3)'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <div class="px-6 py-4" style="border-top:1px solid var(--border)">
            <app-pagination [page]="page()" [pageSize]="pageSize" [total]="total()" [totalPages]="totalPages()" (pageChange)="onPage($event)" />
          </div>
        }
      </div>
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div @modal class="fixed inset-0 z-40 flex items-center justify-center p-4"
        style="background:rgba(15,23,42,0.5);backdrop-filter:blur(8px)">
        <div class="rounded-3xl p-7 w-full max-w-md"
          style="background:var(--surface-2);border:1.5px solid var(--border);box-shadow:var(--shadow-xl)">

          <div class="flex items-center gap-3 mb-6">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
              style="background:rgba(251,146,60,0.10);border:1.5px solid rgba(251,146,60,0.2)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:#ea580c" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h2 class="text-lg font-bold" style="color:var(--text-1)">{{ editingId() ? 'Editar producto' : 'Nuevo producto' }}</h2>
          </div>

          <form (ngSubmit)="save()">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">
                  Nombre <span style="color:var(--accent)">*</span>
                </label>
                <input [(ngModel)]="form.name" name="name" required placeholder="Ej: Manzana Roja"
                  class="inp w-full px-4 py-3 text-sm" style="color:var(--text-1)"/>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">
                  Precio (COP) <span style="color:var(--accent)">*</span>
                </label>
                <input [(ngModel)]="form.price" name="price" type="number" step="1" min="1" required placeholder="0"
                  class="inp w-full px-4 py-3 text-sm" style="color:var(--text-1)"/>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-3)">
                  Proveedor <span style="color:var(--accent)">*</span>
                </label>
                <div class="relative">
                  <select [(ngModel)]="form.supplier_id" name="supplier_id" required
                    class="inp w-full px-4 py-3 text-sm cursor-pointer pr-9 appearance-none" style="color:var(--text-1)">
                    <option [value]="undefined" disabled style="color:var(--text-3)">Seleccionar proveedor…</option>
                    @for (s of suppliers(); track s.id) {
                      <option [value]="s.id" style="color:#0f172a">{{ s.name }}</option>
                    }
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color:var(--text-3)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button type="button" (click)="showModal.set(false)"
                class="flex-1 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all"
                style="background:var(--surface-3);color:var(--text-2);border:1.5px solid var(--border)"
                onmouseenter="this.style.borderColor='var(--accent)'"
                onmouseleave="this.style.borderColor='var(--border)'">Cancelar</button>
              <button type="submit" [disabled]="saving()"
                class="btn-primary flex-1 py-3 rounded-2xl text-sm font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                @if (saving()) {
                  <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                }
                {{ editingId() ? 'Actualizar' : 'Crear producto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-confirm-dialog
      [open]="showConfirm()"
      [title]="'Eliminar producto'"
      [message]="'¿Eliminar ' + (deletingFood()?.name ?? '') + '? Esta acción no se puede deshacer.'"
      (confirm)="deleteConfirmed()"
      (cancel)="showConfirm.set(false)"
    />
  `,
})
export class FoodsListComponent implements OnInit {
  private foodSvc = inject(FoodService);
  private supplierSvc = inject(SupplierService);
  private toast = inject(ToastService);

  foods = signal<Food[]>([]); suppliers = signal<Supplier[]>([]);
  loading = signal(true); saving = signal(false);
  page = signal(1); total = signal(0); totalPages = signal(1); pageSize = 10;
  search = '';
  showModal = signal(false); editingId = signal<number | null>(null); form: Partial<Food & { supplier_id: number }> = {};
  showConfirm = signal(false); deletingFood = signal<Food | null>(null);

  ngOnInit() {
    this.load();
    this.supplierSvc.getAll(1, 100).subscribe((res) => this.suppliers.set(res.items));
  }

  load() {
    this.loading.set(true);
    this.foodSvc.getAll(this.page(), this.pageSize, this.search).subscribe({
      next: (res) => { this.foods.set(res.items); this.total.set(res.total); this.totalPages.set(res.total_pages); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSearch() { this.page.set(1); this.load(); }
  onPage(p: number) { this.page.set(p); this.load(); }
  openCreate() { this.editingId.set(null); this.form = {}; this.showModal.set(true); }
  openEdit(f: Food) { this.editingId.set(f.id); this.form = { name: f.name, price: f.price, supplier_id: f.supplier_id }; this.showModal.set(true); }

  save() {
    if (!this.form.name || !this.form.price || !this.form.supplier_id) return;
    this.saving.set(true);
    const obs = this.editingId() ? this.foodSvc.update(this.editingId()!, this.form) : this.foodSvc.create(this.form);
    obs.subscribe({
      next: () => { this.toast.success(this.editingId() ? 'Producto actualizado' : 'Producto creado'); this.showModal.set(false); this.saving.set(false); this.load(); },
      error: (err) => { this.toast.error(err.error?.detail ?? 'Error al guardar'); this.saving.set(false); },
    });
  }

  confirmDelete(f: Food) { this.deletingFood.set(f); this.showConfirm.set(true); }
  deleteConfirmed() {
    const f = this.deletingFood();
    if (!f) return;
    this.foodSvc.delete(f.id).subscribe({
      next: () => { this.toast.success('Producto eliminado'); this.showConfirm.set(false); this.load(); },
      error: (err) => { this.toast.error(err.error?.detail ?? 'Error al eliminar'); this.showConfirm.set(false); },
    });
  }
}
