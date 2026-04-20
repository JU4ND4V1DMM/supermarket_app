import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between mt-4">
      <p class="text-sm text-gray-500">
        Showing {{ (page - 1) * pageSize + 1 }}–{{ end() }} of {{ total }}
      </p>
      <div class="flex gap-2">
        <button
          (click)="pageChange.emit(page - 1)"
          [disabled]="page <= 1"
          class="px-3 py-1.5 rounded-lg text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >← Prev</button>
        <span class="px-3 py-1.5 text-sm text-gray-400">{{ page }} / {{ totalPages }}</span>
        <button
          (click)="pageChange.emit(page + 1)"
          [disabled]="page >= totalPages"
          class="px-3 py-1.5 rounded-lg text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >Next →</button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  end(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }
}
