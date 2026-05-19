import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutDashboard, Truck, Package, ReceiptText } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { Subscription, filter } from 'rxjs';

interface NavItem {
  path: string;
  label: string;
  sublabel: string;
  icon: any;
  exact?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    ToastComponent,
    LucideAngularModule
  ],
  template: `
    <div class="flex h-screen overflow-hidden" style="background:var(--surface);color:var(--text-1)">

      <aside class="flex flex-col relative z-20 transition-all duration-300 flex-shrink-0"
        [style.width]="collapsed() ? '68px' : '252px'"
        style="background:#1e1b4b;box-shadow:4px 0 40px rgba(99,102,241,0.25)">

        <div class="absolute top-0 left-0 right-0 h-0.5 pointer-events-none z-10"
          style="background:linear-gradient(90deg,#6366f1,#f59e0b,#10b981,#f43f5e,#0ea5e9)">
        </div>

        <div class="absolute -bottom-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
          style="background:radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)">
        </div>

        <div class="flex items-center gap-3 px-4 py-5 relative"
          style="border-bottom:1px solid rgba(255,255,255,0.08)">

          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
              style="background:linear-gradient(135deg,#6366f1,#818cf8);box-shadow:0 8px 24px rgba(99,102,241,0.5)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>

            <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style="background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.8);border:2px solid #1e1b4b">
            </span>
          </div>

          @if (!collapsed()) {
            <div class="animate-fade-in overflow-hidden">
              <p class="font-extrabold text-sm text-white leading-tight">Legumbría La Bendición</p>
              <p class="text-xs mt-0.5" style="color:rgba(255,255,255,0.45)">Sistema de Gestión</p>
            </div>
          }
        </div>

        <button (click)="toggleCollapsed()"
          class="mx-3 mt-3 py-2 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          style="color:rgba(255,255,255,0.4)"
          onmouseenter="this.style.background='rgba(255,255,255,0.07)';this.style.color='white'"
          onmouseleave="this.style.background='';this.style.color='rgba(255,255,255,0.4)'">

          <svg xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 transition-transform duration-300"
            [style.transform]="collapsed() ? 'rotate(0deg)' : 'rotate(180deg)'"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        @if (!collapsed()) {
          <p class="px-5 mt-4 mb-2 text-xs font-bold uppercase tracking-widest"
            style="color:rgba(255,255,255,0.25)">
            Módulos
          </p>
        }

        <nav class="flex-1 px-3 space-y-1 overflow-y-auto pb-4 relative z-10">

          @for (item of navItems; track item.path) {

            <a [routerLink]="item.path"
              routerLinkActive="nav-active-dark"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer border border-transparent"
              style="color:rgba(255,255,255,0.55)"
              onmouseenter="if(!this.classList.contains('nav-active-dark')){this.style.background='rgba(255,255,255,0.07)';this.style.color='white'}"
              onmouseleave="if(!this.classList.contains('nav-active-dark')){this.style.background='';this.style.color='rgba(255,255,255,0.55)'}"
              [title]="collapsed() ? item.label : ''">

              <lucide-icon [img]="item.icon" class="w-5 h-5 text-white flex-shrink-0"></lucide-icon>

              @if (!collapsed()) {
                <div class="overflow-hidden min-w-0">
                  <p class="text-sm font-semibold truncate text-white leading-tight">
                    {{ item.label }}
                  </p>

                  <p class="text-xs truncate mt-0.5"
                    style="color:rgba(255,255,255,0.35)">
                    {{ item.sublabel }}
                  </p>
                </div>
              }

            </a>
          }

        </nav>

        <div class="p-3 relative z-10"
          style="border-top:1px solid rgba(255,255,255,0.08)">

          @if (!collapsed()) {

            <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
              style="background:rgba(255,255,255,0.05)">

              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                style="background:linear-gradient(135deg,#6366f1,#818cf8)">
                {{ userInitial() }}
              </div>

              <div class="overflow-hidden flex-1 min-w-0">
                <p class="text-sm font-bold truncate text-white">
                  {{ auth.currentUser()?.full_name }}
                </p>

                <p class="text-xs truncate"
                  style="color:rgba(255,255,255,0.4)">
                  {{ auth.currentUser()?.email }}
                </p>
              </div>

            </div>
          }

          <button (click)="auth.logout()"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all cursor-pointer"
            style="color:rgba(255,255,255,0.4)"
            [title]="collapsed() ? 'Cerrar sesión' : ''"
            onmouseenter="this.style.background='rgba(244,63,94,0.15)';this.style.color='#f87171'"
            onmouseleave="this.style.background='';this.style.color='rgba(255,255,255,0.4)'">

            <svg xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>

            @if (!collapsed()) {
              <span class="text-sm font-medium">Cerrar sesión</span>
            }

          </button>
        </div>

      </aside>

      <main class="flex-1 flex flex-col overflow-hidden">

        <header class="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
          style="border-bottom:1.5px solid var(--border);background:rgba(255,255,255,0.92);backdrop-filter:blur(20px)">

          <div>
            <h2 class="text-sm font-bold" style="color:var(--text-1)">
              {{ pageTitle() }}
            </h2>

            <p class="text-xs mt-0.5 capitalize" style="color:var(--text-4)">
              {{ pageDate() }}
            </p>
          </div>

          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style="background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2)">

            <span class="dot-live"></span>

            <span class="text-xs font-semibold" style="color:#059669">
              Sistema activo
            </span>

          </div>

        </header>

        <div class="flex-1 overflow-y-auto p-6 lg:p-8">
          <router-outlet />
        </div>

      </main>

    </div>

    <app-toast />
  `,
  styles: [`
    .nav-active-dark {
      background: rgba(99,102,241,0.25)!important;
      border-left: 3px solid #818cf8!important;
      color: white!important;
    }

    .nav-active-dark lucide-icon {
      color: white!important;
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  auth = inject(AuthService);
  private router = inject(Router);
  private routerSub?: Subscription;

  // El estado del sidebar es controlado manualmente por el usuario
  // pero cuando navega a una ruta de detalle de transacción desde aquí
  // recordamos si estaba expandido para restaurarlo al salir
  collapsed = signal(false);
  private userManuallyCollapsed = false;

  ngOnInit() {
    // Escuchar cambios de ruta para restaurar el sidebar al salir del detalle
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      // Si NO está en una ruta de detalle de transacción, expandir si el usuario no lo colapsó manualmente
      const isTransactionDetail = /^\/transactions\/\d+$/.test(url);
      if (!isTransactionDetail && !this.userManuallyCollapsed) {
        this.collapsed.set(false);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  toggleCollapsed() {
    const next = !this.collapsed();
    this.collapsed.set(next);
    this.userManuallyCollapsed = next; // Si el usuario lo colapsó manualmente, respetar su elección
  }

  userInitial() {
    return this.auth.currentUser()?.full_name?.charAt(0)?.toUpperCase() ?? 'U';
  }

  pageTitle() {
    const h = new Date().getHours();
    const n = this.auth.currentUser()?.full_name?.split(' ')[0] ?? '';

    return h < 12
      ? `Buenos días, ${n} 👋`
      : h < 18
        ? `Buenas tardes, ${n} 👋`
        : `Buenas noches, ${n} 👋`;
  }

  pageDate() {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Panel Principal', sublabel: 'Resumen general', exact: true, icon: LayoutDashboard },
    { path: '/suppliers', label: 'Proveedores', sublabel: 'Gestión de proveedores', icon: Truck },
    { path: '/foods', label: 'Productos', sublabel: 'Catálogo y precios', icon: Package },
    { path: '/transactions', label: 'Transacciones', sublabel: 'Ventas y compras', icon: ReceiptText }
  ];

}
