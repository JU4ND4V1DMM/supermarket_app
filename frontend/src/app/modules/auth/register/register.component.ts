import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style="background:var(--surface)">
      <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse at 30% 50%,rgba(16,185,129,0.07) 0%,transparent 60%)"></div>

      <div class="w-full max-w-md relative z-10 animate-fade-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-5"
            style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 8px 32px rgba(16,185,129,0.35)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">Crear cuenta</h1>
          <p class="mt-2 text-sm" style="color:var(--text-2)">Únete a Legumbría La Bendición y gestiona tu supermercado</p>
        </div>

        <div class="p-8 rounded-3xl" style="background:var(--surface-2);border:1px solid var(--border)">
          <form (ngSubmit)="onSubmit()">
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold mb-2" style="color:var(--text-2)">Nombre completo</label>
                <div class="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style="color:var(--text-3)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input [(ngModel)]="fullName" name="fullName" type="text" required placeholder="Juan Pérez"
                    class="inp w-full pl-10 pr-4 py-3 text-sm"/>
                </div>
              </div>
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
                  <input [(ngModel)]="password" name="password" type="password" required placeholder="Mínimo 6 caracteres"
                    class="inp w-full pl-10 pr-4 py-3 text-sm"/>
                </div>
              </div>
            </div>

            <button type="submit" [disabled]="loading()"
              class="btn-primary mt-6 w-full py-3 px-4 rounded-2xl text-white font-bold text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
              @if (loading()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creando cuenta...
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Crear mi cuenta
              }
            </button>
          </form>
        </div>

        <p class="text-center text-sm mt-6" style="color:var(--text-3)">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="font-semibold ml-1 cursor-pointer" style="color:var(--accent)">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  fullName = ''; email = ''; password = '';
  loading = signal(false);

  onSubmit() {
    if (!this.email || !this.password || !this.fullName) return;
    this.loading.set(true);
    this.auth.register(this.email, this.fullName, this.password).subscribe({
      next: () => { this.toast.success('¡Cuenta creada exitosamente!'); this.router.navigate(['/dashboard']); },
      error: (err) => { this.toast.error(err.error?.detail ?? 'Error al registrar.'); this.loading.set(false); },
    });
  }
}
