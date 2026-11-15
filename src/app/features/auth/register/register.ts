import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { KeyValuePipe } from '@angular/common';

type AccountType = 'PARTICIPANT' | 'COMPANY';

@Component({
    selector: 'app-register',
      imports: [ReactiveFormsModule, RouterLink, KeyValuePipe],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected readonly accountType = signal<AccountType>('PARTICIPANT');
    protected readonly loading = signal(false);
    protected readonly errorMessage = signal<string | null>(null);
    protected readonly serverErrors = signal<Record<string, string>>({});

    protected readonly participantForm = this.fb.nonNullable.group({
        firstName: ['', [Validators.required, Validators.maxLength(100)]],
        lastName: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        phone: ['', Validators.maxLength(30)],
        motivation: ['', Validators.maxLength(1000)],
    });

    protected readonly companyForm = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(200)]],
        sector: ['', [Validators.required, Validators.maxLength(100)]],
        address: ['', [Validators.required, Validators.maxLength(255)]],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        city: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        description: ['', Validators.maxLength(2000)],
    });

    protected selectType(type: AccountType): void {
        this.accountType.set(type);
        this.errorMessage.set(null);
        this.serverErrors.set({});
    }

    /** Soll unter dem Feld ein Fehler angezeigt werden? */
    protected showError(control: AbstractControl): boolean {
        return control.touched && control.invalid;
    }

    protected submit(): void {
        const form = this.accountType() === 'PARTICIPANT' ? this.participantForm : this.companyForm;
        if (form.invalid) {
            form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);
        this.serverErrors.set({});

        this.sendRequest().subscribe({
            next: () => this.router.navigateByUrl('/'),
            error: (error: HttpErrorResponse) => this.handleError(error),
        });
    }

    private sendRequest(): Observable<AuthResponse> {
        if (this.accountType() === 'PARTICIPANT') {
            const v = this.participantForm.getRawValue();
            return this.authService.registerParticipant({
                ...v,
                phone: v.phone || undefined,
                motivation: v.motivation || undefined,
            });
        }
        const v = this.companyForm.getRawValue();
        return this.authService.registerCompany({
            ...v,
            description: v.description || undefined,
        });
    }

    private handleError(error: HttpErrorResponse): void {
        this.loading.set(false);

        if (error.status === 409) {
            this.errorMessage.set('Diese E-Mail-Adresse ist bereits registriert.');
        } else if (error.status === 400 && error.error?.errors) {
            this.serverErrors.set(error.error.errors);
            this.errorMessage.set('Bitte prüfe deine Eingaben.');
        } else {
            this.errorMessage.set('Registrierung fehlgeschlagen. Bitte versuche es später erneut.');
        }
    }
}