import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { Slot } from '../../../core/models/slot.models';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SlotService } from '../../../core/services/slot.service';
import { datumLang, zeitspanne } from '../../../core/utils/zeit';
import { ZollstockLeiste } from '../../../shared/zollstock-leiste/zollstock-leiste';

type Zustand = 'laden' | 'fertig' | 'nicht-gefunden' | 'fehler';
type Buchung = 'bereit' | 'laeuft' | 'gebucht';

@Component({
    selector: 'app-termin-detail',
    imports: [RouterLink, ZollstockLeiste],
    templateUrl: './termin-detail.html',
    styleUrl: './termin-detail.css',
})
export class TerminDetail {
    private readonly route = inject(ActivatedRoute);
    private readonly slotService = inject(SlotService);
    private readonly bookingService = inject(BookingService);
    protected readonly authService = inject(AuthService);

    protected readonly zustand = signal<Zustand>('laden');
    protected readonly slot = signal<Slot | null>(null);
    protected readonly buchung = signal<Buchung>('bereit');
    protected readonly buchungsFehler = signal<string | null>(null);

    protected readonly datum = computed(() => {
        const s = this.slot();
        return s ? datumLang(s.startsAt) : '';
    });

    protected readonly uhrzeit = computed(() => {
        const s = this.slot();
        return s ? zeitspanne(s.startsAt, s.endsAt) : '';
    });

    protected readonly platzText = computed(() => {
        const frei = this.slot()?.freeSpots ?? 0;
        if (frei === 0) {
            return 'Ausgebucht';
        }
        return frei === 1 ? '1 Platz frei' : `${frei} Plätze frei`;
    });

    protected readonly istTeilnehmer = computed(() => this.authService.role() === 'PARTICIPANT');

    constructor() {
        // Die ID kommt aus der URL: /termine/<id>
        this.route.paramMap
            .pipe(
                map((params) => params.get('id') ?? ''),
                tap(() => {
                    this.zustand.set('laden');
                    this.buchung.set('bereit');
                    this.buchungsFehler.set(null);
                }),
                switchMap((id) =>
                    this.slotService.findById(id).pipe(
                        map((slot) => ({ slot, status: 200 })),
                        catchError((error: HttpErrorResponse) => of({ slot: null, status: error.status })),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((ergebnis) => {
                this.slot.set(ergebnis.slot);
                if (ergebnis.slot) {
                    this.zustand.set('fertig');
                } else if (ergebnis.status === 404 || ergebnis.status === 400) {
                    this.zustand.set('nicht-gefunden');
                } else {
                    this.zustand.set('fehler');
                }
            });
    }

    protected buchen(): void {
        const s = this.slot();
        if (!s) {
            return;
        }

        this.buchung.set('laeuft');
        this.buchungsFehler.set(null);

        this.bookingService.book(s.id).subscribe({
            next: () => {
                this.buchung.set('gebucht');
                this.neuLaden(s.id); // damit die freien Plätze stimmen
            },
            error: (error: HttpErrorResponse) => {
                this.buchung.set('bereit');
                this.buchungsFehler.set(this.fehlertext(error));
            },
        });
    }

    private neuLaden(id: string): void {
        this.slotService.findById(id).subscribe({
            next: (slot) => this.slot.set(slot),
        });
    }

    /** Das Backend erklärt 409 und 403 schon verständlich ("ausgebucht", "bereits gebucht" …). */
    private fehlertext(error: HttpErrorResponse): string {
        const detail: string | undefined = error.error?.detail;
        if ((error.status === 409 || error.status === 403) && detail) {
            return detail;
        }
        if (error.status === 404) {
            return 'Diesen Termin gibt es nicht mehr.';
        }
        return 'Die Buchung hat nicht geklappt. Bitte versuch es gleich noch einmal.';
    }
}