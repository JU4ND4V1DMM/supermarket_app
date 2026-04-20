import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('backdrop', [transition(':enter',[style({opacity:0}),animate('150ms',style({opacity:1}))]),transition(':leave',[animate('150ms',style({opacity:0}))])]),
    trigger('dialog', [transition(':enter',[style({opacity:0,transform:'scale(0.9) translateY(8px)'}),animate('200ms cubic-bezier(.22,.68,0,1.2)',style({opacity:1,transform:'scale(1) translateY(0)'}))]),transition(':leave',[animate('150ms ease-in',style({opacity:0,transform:'scale(0.95)'}))])]),
  ],
  template: `
    @if (open) {
      <div @backdrop class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7);backdrop-filter:blur(8px)">
        <div @dialog class="rounded-3xl p-6 w-full max-w-sm shadow-2xl" style="background:var(--surface-2);border:1px solid var(--border)">
          <div class="flex items-start gap-4 mb-5">
            <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style="background:rgba(239,68,68,0.12)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <div>
              <h3 class="font-bold text-white">{{ title }}</h3>
              <p class="text-sm mt-1" style="color:var(--text-2)">{{ message }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button (click)="cancel.emit()" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer" style="background:rgba(255,255,255,0.05);color:var(--text-2)">Cancelar</button>
            <button (click)="confirm.emit()" class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer" style="background:linear-gradient(135deg,#ef4444,#dc2626)">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmar eliminación';
  @Input() message = '¿Estás seguro? Esta acción no se puede deshacer.';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
