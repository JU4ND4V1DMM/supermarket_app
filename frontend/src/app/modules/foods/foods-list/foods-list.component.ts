import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodService, Food } from '../../../core/services/food.service';
import { SupplierService, Supplier } from '../../../core/services/supplier.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { trigger, transition, style, animate } from '@angular/animations';

const COP = (n: number) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);

@Component({
  selector: 'app-foods-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PaginationComponent, ConfirmDialogComponent, SpinnerComponent, DropdownModule],
  animations: [
    trigger('fadeUp', [transition(':enter', [style({ opacity:0, transform:'translateY(12px)' }), animate('350ms ease-out', style({ opacity:1, transform:'translateY(0)' }))])]),
    trigger('modal', [transition(':enter', [style({ opacity:0 }), animate('150ms', style({ opacity:1 }))]), transition(':leave', [animate('150ms', style({ opacity:0 }))])]),
  ],
  template: `
    <div @fadeUp>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-7 rounded-full" style="background:linear-gradient(180deg,#f97316,#f59e0b)"></div>
            <h1 class="text-2xl font-extrabold tracking-tight" style="color:var(--text-1)">Productos</h1>
          </div>
          <p class="ml-3.5 text-sm" style="color:var(--text-4)">Catálogo con precio de compra y venta en COP</p>
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
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style="color:var(--text-4)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Buscar producto…"
            class="inp w-full pl-10 pr-4 py-2.5 text-sm"/>
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-2xl overflow-hidden" style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-sm)">
        @if (loading()) { <app-spinner /> }
        @else if (!foods().length) {
          <div class="flex flex-col items-center py-20">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
              style="background:rgba(249,115,22,0.07);border:1.5px solid rgba(249,115,22,0.15)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" style="color:#f97316" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8"/></svg>
            </div>
            <p class="font-semibold" style="color:var(--text-1)">Sin productos</p>
            <button (click)="openCreate()" class="mt-4 btn-primary px-5 py-2 rounded-xl text-sm font-bold cursor-pointer">+ Nuevo</button>
          </div>
        } @else {
          <table class="w-full">
            <thead>
              <tr style="border-bottom:1.5px solid var(--border);background:var(--surface-3)">
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">Producto</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest hidden sm:table-cell" style="color:var(--text-4)">Proveedor</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">P. Compra</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">P. Venta</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-widest hidden lg:table-cell" style="color:var(--text-4)">Margen</th>
                <th class="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (f of foods(); track f.id) {
                <tr style="border-bottom:1px solid var(--border);transition:background 0.15s"
                  onmouseenter="this.style.background='rgba(99,102,241,0.02)'" onmouseleave="this.style.background=''">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style="background:linear-gradient(135deg,rgba(249,115,22,0.12),rgba(249,115,22,0.04));border:1.5px solid rgba(249,115,22,0.18)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" style="color:#f97316" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      </div>
                      <span class="text-sm font-semibold" style="color:var(--text-1)">{{ f.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 hidden sm:table-cell">
                    <span class="text-xs px-2.5 py-1 rounded-lg font-semibold"
                      style="background:rgba(99,102,241,0.07);color:#4338ca;border:1px solid rgba(99,102,241,0.15)">
                      {{ f.supplier?.name ?? '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-bold stat-number" style="color:#6366f1">{{ cop(f.purchase_price) }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-black stat-number" style="color:#059669">{{ cop(f.sale_price) }}</span>
                  </td>
                  <td class="px-6 py-4 hidden lg:table-cell">
                    <span class="text-xs px-2.5 py-1 rounded-full font-bold"
                      [style]="margin(f) >= 0
                        ? 'background:rgba(16,185,129,0.08);color:#059669;border:1px solid rgba(16,185,129,0.2)'
                        : 'background:rgba(244,63,94,0.08);color:#e11d48;border:1px solid rgba(244,63,94,0.2)'">
                      {{ margin(f) >= 0 ? '+' : '' }}{{ margin(f).toFixed(1) }}%
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 justify-end">
                      <button (click)="openEdit(f)" class="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer" style="color:var(--text-4)"
                        onmouseenter="this.style.background='rgba(99,102,241,0.09)';this.style.color='#6366f1'"
                        onmouseleave="this.style.background='transparent';this.style.color='var(--text-4)'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button (click)="confirmDelete(f)" class="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer" style="color:var(--text-4)"
                        onmouseenter="this.style.background='rgba(244,63,94,0.09)';this.style.color='#e11d48'"
                        onmouseleave="this.style.background='transparent';this.style.color='var(--text-4)'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
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
        style="background:rgba(30,27,75,0.55);backdrop-filter:blur(10px)" (click)="showModal.set(false)">
        <div class="rounded-3xl p-7 w-full max-w-md" style="background:#ffffff;border:1.5px solid var(--border);box-shadow:var(--shadow-xl)"
          (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              style="background:rgba(249,115,22,0.10);border:1.5px solid rgba(249,115,22,0.2)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" style="color:#f97316" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-extrabold" style="color:var(--text-1)">{{ editingId() ? 'Editar producto' : 'Nuevo producto' }}</h2>
              <p class="text-xs" style="color:var(--text-4)">Precios de compra y venta separados</p>
            </div>
          </div>
          <form (ngSubmit)="save()">
            <!-- Name -->
            <div class="mb-4">
              <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">Nombre *</label>
              <input [(ngModel)]="form.name" name="name" required placeholder="Ej: Arroz Diana 500g" class="inp w-full px-4 py-3 text-sm"/>
            </div>
            <!-- Dual prices -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">
                  Precio Compra (COP) <span style="color:#6366f1">*</span>
                </label>
                <input [(ngModel)]="form.purchase_price" name="purchase_price" type="number" step="1" min="1" required placeholder="0"
                  class="inp w-full px-4 py-3 text-sm"/>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">
                  Precio Venta (COP) <span style="color:#059669">*</span>
                </label>
                <input [(ngModel)]="form.sale_price" name="sale_price" type="number" step="1" min="1" required placeholder="0"
                  class="inp w-full px-4 py-3 text-sm"/>
              </div>
            </div>
            <!-- Margin preview -->
            @if ((form.purchase_price ?? 0) > 0 && (form.sale_price ?? 0) > 0) {
              <div class="mb-4 p-3 rounded-xl text-center text-sm font-semibold"
                [style]="formMargin() >= 0
                  ? 'background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.18);color:#059669'
                  : 'background:rgba(244,63,94,0.06);border:1px solid rgba(244,63,94,0.18);color:#e11d48'">
                Margen {{ formMargin() >= 0 ? '+' : '' }}{{ formMargin().toFixed(1) }}%
                · {{ cop((form.sale_price ?? 0) - (form.purchase_price ?? 0)) }} por unidad
              </div>
            }
            <!-- Supplier via PrimeNG dropdown -->
            <div class="mb-6">
              <label class="block text-xs font-bold uppercase tracking-widest mb-2" style="color:var(--text-4)">Proveedor *</label>
              <p-dropdown [options]="supplierOptions()" [(ngModel)]="form.supplier_id" name="supplier_id"
                optionLabel="label" optionValue="value" placeholder="Seleccionar proveedor…"
                styleClass="w-full" appendTo="body" [filter]="true" filterPlaceholder="Buscar…">
              </p-dropdown>
            </div>
            <div class="flex gap-3">
              <button type="button" (click)="showModal.set(false)"
                class="flex-1 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all"
                style="background:var(--surface-3);color:var(--text-2);border:1.5px solid var(--border)">Cancelar</button>
              <button type="submit" [disabled]="saving()"
                class="btn-primary flex-1 py-3 rounded-2xl text-sm font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                @if (saving()) { <div class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> }
                {{ editingId() ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-confirm-dialog [open]="showConfirm()" [title]="'Eliminar producto'"
      [message]="'¿Eliminar ' + (deletingFood()?.name ?? '') + '?'"
      (confirm)="deleteConfirmed()" (cancel)="showConfirm.set(false)" />
  `,
})
export class FoodsListComponent implements OnInit {
  private foodSvc = inject(FoodService);
  private supplierSvc = inject(SupplierService);
  private toast = inject(ToastService);

  foods = signal<Food[]>([]); suppliers = signal<Supplier[]>([]);
  loading = signal(true); saving = signal(false);
  page = signal(1); total = signal(0); totalPages = signal(1); pageSize = 10; search = '';
  showModal = signal(false); editingId = signal<number|null>(null);
  form: any = {};
  showConfirm = signal(false); deletingFood = signal<Food|null>(null);

  supplierOptions() { return this.suppliers().map(s => ({ label: s.name, value: s.id })); }

  ngOnInit() { this.load(); this.supplierSvc.getAll(1,100).subscribe(r => this.suppliers.set(r.items)); }
  load() {
    this.loading.set(true);
    this.foodSvc.getAll(this.page(), this.pageSize, this.search).subscribe({
      next:(r)=>{ this.foods.set(r.items); this.total.set(r.total); this.totalPages.set(r.total_pages); this.loading.set(false); },
      error:()=>this.loading.set(false)
    });
  }
  onSearch() { this.page.set(1); this.load(); }
  onPage(p: number) { this.page.set(p); this.load(); }
  openCreate() { this.editingId.set(null); this.form = {}; this.showModal.set(true); }
  openEdit(f: Food) { this.editingId.set(f.id); this.form = { name:f.name, purchase_price:f.purchase_price, sale_price:f.sale_price, supplier_id:f.supplier_id }; this.showModal.set(true); }
  margin(f: Food) { return f.purchase_price ? ((f.sale_price - f.purchase_price)/f.purchase_price)*100 : 0; }
  formMargin() { const p=this.form.purchase_price??0, s=this.form.sale_price??0; return p ? ((s-p)/p)*100 : 0; }
  cop(n: number) { return COP(n); }
  save() {
    if (!this.form.name||!this.form.purchase_price||!this.form.sale_price||!this.form.supplier_id) return;
    this.saving.set(true);
    const obs = this.editingId() ? this.foodSvc.update(this.editingId()!, this.form) : this.foodSvc.create(this.form);
    obs.subscribe({
      next:()=>{ this.toast.success(this.editingId() ? 'Producto actualizado' : 'Producto creado'); this.showModal.set(false); this.saving.set(false); this.load(); },
      error:(e)=>{ this.toast.error(e.error?.detail ?? 'Error'); this.saving.set(false); }
    });
  }
  confirmDelete(f: Food) { this.deletingFood.set(f); this.showConfirm.set(true); }
  deleteConfirmed() {
    const f = this.deletingFood(); if(!f) return;
    this.foodSvc.delete(f.id).subscribe({
      next:()=>{ this.toast.success('Eliminado'); this.showConfirm.set(false); this.load(); },
      error:(e)=>{ this.toast.error(e.error?.detail ?? 'Error'); this.showConfirm.set(false); }
    });
  }
}
