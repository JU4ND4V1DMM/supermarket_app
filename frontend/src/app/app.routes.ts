import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { numericIdGuard } from './core/guards/numeric-id.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 't/:id',
    canActivate: [numericIdGuard],
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/transactions/transaction-detail/transaction-detail.component').then((m) => m.TransactionDetailComponent),
      },
    ],
  },
  {
    path: 'transactions/new',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/transactions/transaction-form/transaction-form.component').then((m) => m.TransactionFormComponent),
  },
  {
    path: 'transactions/:id',
    canActivate: [numericIdGuard],
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/transactions/transaction-detail/transaction-detail.component').then((m) => m.TransactionDetailComponent),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'suppliers', loadChildren: () => import('./modules/suppliers/suppliers.routes').then((m) => m.suppliersRoutes) },
      { path: 'foods', loadChildren: () => import('./modules/foods/foods.routes').then((m) => m.foodsRoutes) },
      { path: 'transactions', loadChildren: () => import('./modules/transactions/transactions.routes').then((m) => m.transactionsRoutes) },
    ],
  },
  { path: '**', redirectTo: '' },
];