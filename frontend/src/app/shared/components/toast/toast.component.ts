import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%) scale(0.9)' }),
        animate('250ms cubic-bezier(.22,.68,0,1.2)', style({ opacity: 1, transform: 'translateX(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateX(100%) scale(0.9)' })),
      ]),
    ]),
  ],
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div @toastAnim (click)="toastService.dismiss(toast.id)"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl cursor-pointer min-w-72 max-w-sm"
          [class]="toastClass(toast.type)"
          style="backdrop-filter:blur(16px)">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" [class]="iconBg(toast.type)">
            <span [innerHTML]="toastIcon(toast.type)"></span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold">{{ toastTitle(toast.type) }}</p>
            <p class="text-xs mt-0.5 opacity-80">{{ toast.message }}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 opacity-50 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClass(type: string): string {
    return { success: 'bg-emerald-950/95 text-emerald-100 border border-emerald-500/30', error: 'bg-red-950/95 text-red-100 border border-red-500/30', info: 'bg-blue-950/95 text-blue-100 border border-blue-500/30' }[type] ?? '';
  }
  iconBg(type: string): string {
    return { success: 'bg-emerald-500/20', error: 'bg-red-500/20', info: 'bg-blue-500/20' }[type] ?? '';
  }
  toastTitle(type: string): string {
    return { success: 'Éxito', error: 'Error', info: 'Información' }[type] ?? '';
  }
  toastIcon(type: string): string {
    return {
      success: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:   `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      info:    `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    }[type] ?? '';
  }
}
