import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'Probetag',
    },
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
        title: 'Anmelden | Probetag',
    },
    {
        path: 'registrieren',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
        title: 'Registrieren | Probetag',
    },
    {
        path: 'termine',
        loadComponent: () =>
            import('./features/slots/termin-suche/termin-suche').then((m) => m.TerminSuche),
        title: 'Termine | Probetag',
    },
    {
        path: 'termine/:id',
        loadComponent: () =>
            import('./features/slots/termin-detail/termin-detail').then((m) => m.TerminDetail),
        title: 'Termin | Probetag',
    },
    {
        path: 'meine-buchungen',
        canActivate: [roleGuard('PARTICIPANT')],
        loadComponent: () =>
            import('./features/bookings/meine-buchungen/meine-buchungen').then((m) => m.MeineBuchungen),
        title: 'Meine Buchungen | Probetag',
    },
    {
        path: 'unternehmen',
        canActivate: [roleGuard('COMPANY')],
        title: 'Meine Termine – Probetag',
        loadComponent: () =>
            import('./features/company/meine-termine/meine-termine').then((m) => m.MeineTermine),
    },
    {
        path: '**',
        redirectTo: '',
    },
];  