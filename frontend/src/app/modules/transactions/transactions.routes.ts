import { Routes } from '@angular/router';

export const transactionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./transactions-list/transactions-list.component').then(
        (m) => m.TransactionsListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./transaction-form/transaction-form.component').then(
        (m) => m.TransactionFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./transaction-detail/transaction-detail.component').then(
        (m) => m.TransactionDetailComponent
      ),
  },
];
