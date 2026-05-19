import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex overflow-hidden" style="background:var(--surface)">

      <!-- Left panel — decorative -->
      <div class="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style="background:linear-gradient(145deg,#0a1628 0%,#0f2218 50%,#0a1628 100%)">
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-20"
          style="background-image:linear-gradient(rgba(16,185,129,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.15) 1px,transparent 1px);background-size:40px 40px"></div>
        <!-- Glow orbs -->
        <div class="absolute w-96 h-96 rounded-full" style="background:radial-gradient(circle,rgba(16,185,129,0.18) 0%,transparent 70%);top:-80px;left:-80px"></div>
        <div class="absolute w-64 h-64 rounded-full" style="background:radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%);bottom:40px;right:40px"></div>

        <div class="relative z-10 text-center max-w-md animate-fade-up">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8"
            style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 8px 40px rgba(16,185,129,0.4)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h1 class="text-4xl font-extrabold text-white mb-4 tracking-tight">Legumbría La Bendición</h1>
          <p class="text-lg mb-8" style="color:rgba(255,255,255,0.5)">
            Gestión inteligente de tu supermercado con trazabilidad completa de productos.
          </p>
          <div class="grid grid-cols-3 gap-4">
            @for (stat of stats; track stat.label) {
              <div class="p-4 rounded-2xl" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)">
                <p class="text-2xl font-bold text-emerald-400">{{ stat.value }}</p>
                <p class="text-xs mt-1" style="color:rgba(255,255,255,0.4)">{{ stat.label }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Right panel — form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div class="w-full max-w-md animate-fade-up" style="animation-delay:0.1s">

          <!-- Mobile logo -->
          <div class="flex items-center gap-3 mb-8 lg:hidden">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              style="background:linear-gradient(135deg,#10b981,#059669)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <span class="text-xl font-bold text-white">Legumbría La Bendición</span>
          </div>

          <div class="mb-8">
            <h2 class="text-3xl font-extrabold text-indigo-600 tracking-tight">Bienvenido de vuelta</h2>
            <p class="mt-2" style="color:var(--text-2)">Ingresa a tu cuenta para continuar</p>
          </div>

          <div class="p-8 rounded-3xl" style="background:var(--surface-2);border:1px solid var(--border)">
            <form (ngSubmit)="onSubmit()">
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-semibold mb-2" style="color:var(--text-2)">Correo electrónico</label>
                  <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style="color:var(--text-3)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input [(ngModel)]="email" name="email" type="email" required placeholder="tu@correo.com"
                      class="inp w-full pl-10 pr-4 py-3 text-sm"/>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2" style="color:var(--text-2)">Contraseña</label>
                  <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style="color:var(--text-3)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input [(ngModel)]="password" name="password" [type]="showPw() ? 'text' : 'password'" required placeholder="••••••••"
                      class="inp w-full pl-10 pr-12 py-3 text-sm"/>
                    <button type="button" (click)="showPw.set(!showPw())"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                      style="color:var(--text-3)">
                      @if (showPw()) {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" [disabled]="loading()"
                class="btn-primary mt-6 w-full py-3 px-4 rounded-2xl text-white font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                @if (loading()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Ingresando...
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Ingresar al sistema
                }
              </button>
            </form>
          </div>

          <p class="text-center text-sm mt-6" style="color:var(--text-3)">
            ¿No tienes cuenta?
            <a routerLink="/auth/register" class="font-semibold ml-1 cursor-pointer transition-colors"
              style="color:var(--accent)">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  showPw = signal(false);

  stats = [
    { value: '100%', label: 'Trazabilidad' },
    { value: '24/7', label: 'Disponible' },
    { value: 'v1.0', label: 'Versión' },
  ];

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.toast.success('¡Bienvenido!'); this.router.navigate(['/dashboard']); },
      error: (err) => { this.toast.error(err.error?.detail ?? 'Credenciales incorrectas.'); this.loading.set(false); },
    });
  }
}
