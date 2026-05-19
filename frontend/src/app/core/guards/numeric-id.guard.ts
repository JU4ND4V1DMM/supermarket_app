import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const numericIdGuard: CanActivateFn = (route) => {
    const id = route.paramMap.get('id');
    if (id && /^\d+$/.test(id)) return true;
    return inject(Router).createUrlTree(['/']);
};