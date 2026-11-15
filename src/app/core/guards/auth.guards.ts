import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

/** Nur für eingeloggte Benutzer. Sonst -> Login-Seite. */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.getToken()) {
        return true;
    }
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Nur für bestimmte Rollen. Nicht eingeloggt -> Login, falsche Rolle -> Startseite. */
export function roleGuard(...allowedRoles: Role[]): CanActivateFn {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.getToken()) {
            return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }

        const role = authService.role();
        if (role !== null && allowedRoles.includes(role)) {
            return true;
        }
        return router.createUrlTree(['/']);
    };
}

/** Nur für NICHT eingeloggte Benutzer (Login, Registrierung). Sonst -> Startseite. */
export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getToken() ? router.createUrlTree(['/']) : true;
};