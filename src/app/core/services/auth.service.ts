import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AuthResponse,
    LoginRequest,
    RegisterCompanyRequest,
    RegisterParticipantRequest,
    Role,
} from '../models/auth.models';

/** Was wir uns über den eingeloggten Benutzer merken. */
export interface CurrentUser {
    userId: string;
    email: string;
    role: Role;
    token: string;
    expiresAt: number; // Zeitpunkt in Millisekunden, wann das Token abläuft
}

const STORAGE_KEY = 'probetag.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly url = `${environment.apiUrl}/auth`;

    // Der aktuelle Benutzer: beim Start aus dem Browser-Speicher geladen
    private readonly currentUser = signal<CurrentUser | null>(this.loadFromStorage());

    // Von außen nur lesbar
    readonly user = this.currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this.currentUser() !== null);
    readonly role = computed(() => this.currentUser()?.role ?? null);

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.url}/login`, request)
            .pipe(tap((response) => this.storeSession(response)));
    }

    registerParticipant(request: RegisterParticipantRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.url}/register/participant`, request)
            .pipe(tap((response) => this.storeSession(response)));
    }

    registerCompany(request: RegisterCompanyRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.url}/register/company`, request)
            .pipe(tap((response) => this.storeSession(response)));
    }

    logout(): void {
        this.clearSession();
        this.router.navigateByUrl('/login');
    }

    /** Das Token für Anfragen ans Backend, oder null, wenn keins da oder abgelaufen ist. */
    getToken(): string | null {
        const user = this.currentUser();
        if (!user) {
            return null;
        }
        if (Date.now() >= user.expiresAt) {
            this.clearSession();
            return null;
        }
        return user.token;
    }

    // ---------- Hilfsmethoden ----------

    private storeSession(response: AuthResponse): void {
        const user: CurrentUser = {
            userId: response.userId,
            email: response.email,
            role: response.role,
            token: response.token,
            expiresAt: Date.now() + response.expiresInSeconds * 1000,
        };
        this.currentUser.set(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    private clearSession(): void {
        this.currentUser.set(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    private loadFromStorage(): CurrentUser | null {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return null;
            }
            const user = JSON.parse(raw) as CurrentUser;
            return user.expiresAt > Date.now() ? user : null;
        } catch {
            return null;
        }
    }
}