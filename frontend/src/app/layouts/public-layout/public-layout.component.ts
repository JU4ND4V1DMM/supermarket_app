import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ToastComponent],
  template: `
    <div class="flex h-screen overflow-hidden" style="background:var(--surface);color:var(--text-1)">

      <!-- Minimal sidebar: always collapsed, solo iconos -->
      <aside class="flex flex-col relative z-20 flex-shrink-0 transition-all duration-300"
        style="width:68px;background:#1e1b4b;box-shadow:4px 0 40px rgba(99,102,241,0.25)">

        <div class="absolute top-0 left-0 right-0 h-0.5 pointer-events-none z-10"
          style="background:linear-gradient(90deg,#6366f1,#f59e0b,#10b981,#f43f5e,#0ea5e9)">
        </div>

        <!-- Logo icon -->
        <div class="flex items-center justify-center px-4 py-5"
          style="border-bottom:1px solid rgba(255,255,255,0.08)">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style="background:linear-gradient(135deg,#6366f1,#818cf8);box-shadow:0 8px 24px rgba(99,102,241,0.5)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
        </div>

        <div class="flex-1"></div>

        <!-- Login / Ir al sistema -->
        <div class="p-3" style="border-top:1px solid rgba(255,255,255,0.08)">
          @if (auth.isAuthenticated()) {
            <a routerLink="/dashboard"
              title="Ir al sistema"
              class="flex items-center justify-center w-full px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              style="color:rgba(255,255,255,0.4)"
              onmouseenter="this.style.background='rgba(255,255,255,0.07)';this.style.color='white'"
              onmouseleave="this.style.background='';this.style.color='rgba(255,255,255,0.4)'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </a>
          } @else {
            <a routerLink="/auth/login"
              title="Iniciar sesión"
              class="flex items-center justify-center w-full px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              style="color:rgba(255,255,255,0.4)"
              onmouseenter="this.style.background='rgba(99,102,241,0.2)';this.style.color='#818cf8'"
              onmouseleave="this.style.background='';this.style.color='rgba(255,255,255,0.4)'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </a>
          }
        </div>
      </aside>

      <main class="flex-1 flex flex-col overflow-hidden">

        <!-- Header público -->
        <header class="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
          style="border-bottom:1.5px solid var(--border);background:rgba(255,255,255,0.92);backdrop-filter:blur(20px)">

          <div class="flex items-center gap-2">
            <span class="text-sm font-bold" style="color:var(--text-1)">Legumbría La Bendición</span>
            <span class="text-xs px-2 py-0.5 rounded-lg font-semibold" style="background:rgba(99,102,241,0.08);color:#6366f1">Vista pública</span>
          </div>

          @if (!auth.isAuthenticated()) {
            <a routerLink="/auth/login"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style="background:linear-gradient(135deg,#6366f1,#818cf8);color:white;box-shadow:0 4px 14px rgba(99,102,241,0.35)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Iniciar sesión
            </a>
          } @else {
            <a routerLink="/dashboard"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style="background:linear-gradient(135deg,#6366f1,#818cf8);color:white;box-shadow:0 4px 14px rgba(99,102,241,0.35)">
              Ir al sistema →
            </a>
          }
        </header>

        <div class="flex-1 overflow-y-auto p-6 lg:p-8">
          <router-outlet />
        </div>

      </main>

    </div>

    <app-toast />
  `,
})
export class PublicLayoutComponent {
  auth = inject(AuthService);
}
