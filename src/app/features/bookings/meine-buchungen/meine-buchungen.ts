import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '../../../core/models/booking.models';
import { BookingService } from '../../../core/services/booking.service';
import { datumLang, zeitspanne } from '../../../core/utils/zeit';
import { ZollstockLeiste } from '../../../shared/zollstock-leiste/zollstock-leiste';
import { BewertungsFormular } from '../bewertungs-formular/bewertungs-formular';

type Zustand = 'laden' | 'fertig' | 'fehler';

const STORNO_FRIST_MS = 24 * 60 * 60 * 1000; // 24 Stunden, wie im Backend

const STATUS_TEXT: Record<BookingStatus, string> = {
    CONFIRMED: 'Gebucht',
    CANCELLED: 'Storniert',
    ATTENDED: 'Teilgenommen',
    NO_SHOW: 'Nicht erschienen',
};

@Component({
    selector: 'app-meine-buchungen',
    imports: [RouterLink, ZollstockLeiste, BewertungsFormular],
    templateUrl: './meine-buchungen.html',
    styleUrl: './meine-buchungen.css',
})
export class MeineBuchungen {
    private readonly bookingService = inject(BookingService);

    protected readonly zustand = signal<Zustand>('laden');
    protected readonly buchungen = signal<Booking[]>([]);

    /** Bei welcher Buchung fragen wir gerade "Wirklich stornieren?" */
    protected readonly nachfrageId = signal<string | null>(null);
    /** Welche Buchung wird gerade storniert? */
    protected readonly laeuftId = signal<string | null>(null);
    protected readonly fehler = signal<{ id: string; text: string } | null>(null);

    /** Bei welcher Buchung ist das Bewertungsformular offen? */
    protected readonly bewertenId = signal<string | null>(null);

    protected readonly kommende = computed(() =>
        this.buchungen()
            .filter((b) => this.istKommend(b))
            .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    );

    protected readonly fruehere = computed(() => this.buchungen().filter((b) => !this.istKommend(b)));

    constructor() {
        this.laden();
    }

    protected laden(): void {
        this.zustand.set('laden');
        this.bookingService.myBookings().subscribe({
            next: (buchungen) => {
                this.buchungen.set(buchungen);
                this.zustand.set('fertig');
            },
            error: () => this.zustand.set('fehler'),
        });
    }

    // ---------- Stornieren ----------

    protected nachfragen(id: string): void {
        this.fehler.set(null);
        this.nachfrageId.set(id);
    }

    protected abbrechen(): void {
        this.nachfrageId.set(null);
    }
    protected bewertungOeffnen(id: string): void {
        this.bewertenId.set(id);
    }

    protected bewertungGespeichert(id: string): void {
        this.buchungen.update((liste) => liste.map((b) => (b.id === id ? { ...b, reviewed: true } : b)));
        this.bewertenId.set(null);
    }

    protected stornieren(buchung: Booking): void {
        this.laeuftId.set(buchung.id);
        this.fehler.set(null);

        this.bookingService.cancel(buchung.id).subscribe({
            next: (aktualisiert) => {
                // Die stornierte Buchung in der Liste ersetzen
                this.buchungen.update((liste) => liste.map((b) => (b.id === aktualisiert.id ? aktualisiert : b)));
                this.laeuftId.set(null);
                this.nachfrageId.set(null);
            },
            error: (error: HttpErrorResponse) => {
                this.laeuftId.set(null);
                this.fehler.set({
                    id: buchung.id,
                    text: error.error?.detail ?? 'Das Stornieren hat nicht geklappt. Bitte versuch es noch einmal.',
                });
            },
        });
    }

    // ---------- Hilfen für das Template ----------

    protected kannStornieren(b: Booking): boolean {
        return Date.parse(b.startsAt) - Date.now() > STORNO_FRIST_MS;
    }

    protected statusText(b: Booking): string {
        return STATUS_TEXT[b.status];
    }

    protected datum(b: Booking): string {
        return datumLang(b.startsAt);
    }

    protected uhrzeit(b: Booking): string {
        return zeitspanne(b.startsAt, b.endsAt);
    }

    private istKommend(b: Booking): boolean {
        return b.status === 'CONFIRMED' && Date.parse(b.startsAt) > Date.now();
    }
}