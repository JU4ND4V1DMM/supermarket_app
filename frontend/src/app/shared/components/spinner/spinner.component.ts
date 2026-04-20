import { Component } from '@angular/core';
@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-2 border-white/5"></div>
        <div class="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium animate-pulse" style="color:var(--text-3)">Cargando...</p>
    </div>
  `,
})
export class SpinnerComponent {}
