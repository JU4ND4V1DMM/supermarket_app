import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

interface NavItem {
  path: string;
  label: string;
  sublabel: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastComponent],
  template: `
    <div class="flex h-screen overflow-hidden" style="background:var(--surface);color:var(--text-1)">

      <!-- ════════════════════════ SIDEBAR ════════════════════════ -->
      <aside class="flex flex-col relative z-20 transition-all duration-300 ease-in-out flex-shrink-0"
        [style.width]="collapsed() ? '68px' : '252px'"
        style="background:var(--surface-2);border-right:1.5px solid var(--border);box-shadow:4px 0 32px rgba(15,23,42,0.06)">

        <!-- Top gradient stripe -->
        <div class="absolute top-0 left-0 right-0 h-0.5 pointer-events-none z-10"
          style="background:linear-gradient(90deg,#0ea5e9,#6366f1,#f59e0b)"></div>

        <!-- Decorative blur orb inside sidebar -->
        <div class="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
          style="background:radial-gradient(ellipse at 50% 100%, rgba(14,165,233,0.06) 0%, transparent 70%)"></div>

        <!-- Logo -->
        <div class="flex items-center gap-3 px-4 py-5 relative" style="border-bottom:1.5px solid var(--border)">
          <div class="relative flex-shrink-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
              style="background:linear-gradient(135deg,#0ea5e9,#6366f1);box-shadow:var(--shadow-accent)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <!-- Live dot -->
            <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style="background:#22c55e;box-shadow:0 0 7px rgba(34,197,94,0.7);border:1.5px solid white"></span>
          </div>
          @if (!collapsed()) {
            <div class="overflow-hidden animate-fade-in">
              <p class="font-extrabold text-sm leading-tight tracking-tight" style="color:var(--text-1)">Legumbría La Bendición</p>
              <p class="text-xs mt-0.5" style="color:var(--text-3)">Sistema de Gestión</p>
            </div>
          }
        </div>

        <!-- Collapse toggle -->
        <button (click)="collapsed.set(!collapsed())"
          class="flex items-center justify-center mx-3 mt-3 py-2 rounded-xl transition-all duration-150 cursor-pointer"
          style="color:var(--text-3)" title="Colapsar menú"
          onmouseenter="this.style.background='rgba(14,165,233,0.06)';this.style.color='var(--accent)'"
          onmouseleave="this.style.background='';this.style.color='var(--text-3)'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300"
            [style.transform]="collapsed() ? 'rotate(0deg)' : 'rotate(180deg)'"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <!-- Section label -->
        @if (!collapsed()) {
          <p class="px-5 mt-4 mb-2 text-xs font-bold uppercase tracking-widest" style="color:var(--text-4)">Módulos</p>
        }

        <!-- Navigation -->
        <nav class="flex-1 px-3 space-y-1 overflow-y-auto pb-4 relative z-10">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path"
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer border border-transparent"
              style="color:var(--text-2)"
              onmouseenter="if(!this.classList.contains('nav-active')){this.style.background='rgba(14,165,233,0.06)';this.style.color='var(--text-1)'}"
              onmouseleave="if(!this.classList.contains('nav-active')){this.style.background='';this.style.color='var(--text-2)'}"
              [title]="collapsed() ? item.label : ''">
              <span class="flex-shrink-0 w-5 h-5" [innerHTML]="item.icon"></span>
              @if (!collapsed()) {
                <div class="overflow-hidden min-w-0">
                  <p class="text-sm font-semibold truncate leading-tight">{{ item.label }}</p>
                  <p class="text-xs truncate mt-0.5" style="color:var(--text-4)">{{ item.sublabel }}</p>
                </div>
              }
            </a>
          }
        </nav>

        <!-- User card -->
        <div class="p-3 relative z-10" style="border-top:1.5px solid var(--border)">
          @if (!collapsed()) {
            <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style="background:var(--surface-3)">
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                style="background:linear-gradient(135deg,#0ea5e9,#6366f1)">
                {{ userInitial() }}
              </div>
              <div class="overflow-hidden flex-1 min-w-0">
                <p class="text-sm font-bold truncate" style="color:var(--text-1)">{{ auth.currentUser()?.full_name }}</p>
                <p class="text-xs truncate" style="color:var(--text-3)">{{ auth.currentUser()?.email }}</p>
              </div>
            </div>
          }
          <button (click)="auth.logout()"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
            style="color:var(--text-3)"
            [title]="collapsed() ? 'Cerrar sesión' : ''"
            onmouseenter="this.style.background='rgba(239,68,68,0.06)';this.style.color='#ef4444'"
            onmouseleave="this.style.background='';this.style.color='var(--text-3)'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-sm font-medium">Cerrar sesión</span>
            }
          </button>
        </div>
      </aside>

      <!-- ════════════════════════ MAIN CONTENT ════════════════════════ -->
      <main class="flex-1 flex flex-col overflow-hidden" style="color:var(--text-1)">

        <!-- Top bar -->
        <header class="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style="border-bottom:1.5px solid var(--border);background:rgba(255,255,255,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)">

          <div>
            <h2 class="text-sm font-bold" style="color:var(--text-1)">{{ pageTitle() }}</h2>
            <p class="text-xs mt-0.5 capitalize" style="color:var(--text-3)">{{ pageDate() }}</p>
          </div>

          <!-- Status pill -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style="background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2)">
            <span class="dot-live"></span>
            <span class="text-xs font-semibold" style="color:#059669">Sistema activo</span>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-6 lg:p-8" style="color:var(--text-1)">
          <router-outlet />
        </div>
      </main>
    </div>

    <app-toast />
  `,
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  userInitial() {
    return this.auth.currentUser()?.full_name?.charAt(0)?.toUpperCase() ?? 'U';
  }

  pageTitle() {
    const hour = new Date().getHours();
    const name = this.auth.currentUser()?.full_name?.split(' ')[0] ?? '';
    if (hour < 12) return `Buenos días, ${name} 👋`;
    if (hour < 18) return `Buenas tardes, ${name} 👋`;
    return `Buenas noches, ${name} 👋`;
  }

  pageDate() {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  navItems: NavItem[] = [
    {
      path: '/dashboard', label: 'Panel Principal', sublabel: 'Resumen general', exact: true,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    },
    {
      path: '/suppliers', label: 'Proveedores', sublabel: 'Gestión de proveedores',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    },
    {
      path: '/foods', label: 'Productos', sublabel: 'Catálogo de alimentos',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    },
    {
      path: '/transactions', label: 'Transacciones', sublabel: 'Ventas y compras',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    },
  ];
}
