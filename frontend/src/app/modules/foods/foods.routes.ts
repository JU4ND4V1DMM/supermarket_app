import { Routes } from '@angular/router';

export const foodsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./foods-list/foods-list.component').then((m) => m.FoodsListComponent),
  },
];
