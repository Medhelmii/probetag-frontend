import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    protected readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
    });

    protected readonly loading = signal(false);
    protected readonly errorMessage = signal<string | null>(null);

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched(); // zeigt alle Fehlermeldungen an
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);

        this.authService.login(this.form.getRawValue()).subscribe({
            next: () => {
                // zurück dorthin, wohin man wollte (vom Guard gemerkt), sonst zur Startseite
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
                this.router.navigateByUrl(returnUrl);
            },
            error: (error: HttpErrorResponse) => {
                this.loading.set(false);
                this.errorMessage.set(
                    error.status === 401
                        ? 'E-Mail oder Passwort ist falsch.'
                        : 'Anmeldung fehlgeschlagen. Bitte versuche es später erneut.',
                );
            },
        });
    }
}