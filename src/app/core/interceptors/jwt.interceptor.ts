import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Token nur an UNSER Backend schicken, niemals an fremde Adressen
    const isApiRequest = request.url.startsWith(environment.apiUrl);
    const sendToken = token !== null && isApiRequest;

    const outgoing = sendToken
        ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : request;

    return next(outgoing).pipe(
        catchError((error: HttpErrorResponse) => {
            // Token geschickt, aber 401 zurück -> Token ungültig oder abgelaufen
            if (error.status === 401 && sendToken) {
                authService.logout();
            }
            return throwError(() => error);
        }),
    );
};