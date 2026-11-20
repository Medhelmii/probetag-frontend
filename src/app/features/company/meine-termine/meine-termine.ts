import { Component, computed, inject, signal } from '@angular/core';
import { SlotService } from '../../../core/services/slot.service';
import { Slot } from '../../../core/models/slot.models';
import { ZollstockLeiste } from '../../../shared/zollstock-leiste/zollstock-leiste';
import { datumLang, zeitspanne } from '../../../core/utils/zeit';
import { NgTemplateOutlet } from '@angular/common';
type Zustand = 'laden' | 'fertig' | 'fehler';

@Component({
    selector: 'app-meine-termine',
    imports: [ZollstockLeiste, NgTemplateOutlet],
    templateUrl: './meine-termine.html',
    styleUrl: './meine-termine.css',
})
export class MeineTermine {
    private readonly slotService = inject(SlotService);

    protected readonly zustand = signal<Zustand>('laden');
    protected readonly termine = signal<Slot[]>([]);

    protected readonly kommende = computed(() =>
        this.termine()
            .filter((t) => t.status !== 'CANCELLED' && new Date(t.startsAt) > new Date())
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    );

    protected readonly fruehere = computed(() =>
        this.termine()
            .filter((t) => !this.kommende().includes(t))
            .sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    );

    protected readonly datumLang = datumLang;
    protected readonly zeitspanne = zeitspanne;

    constructor() {
        this.laden();
    }

    protected laden(): void {
        this.zustand.set('laden');
        this.slotService.mySlots().subscribe({
            next: (liste) => {
                this.termine.set(liste);
                this.zustand.set('fertig');
            },
            error: () => this.zustand.set('fehler'),
        });
    }

    /** Ein Eintrag pro Platz: true = belegt */
    protected plaetze(t: Slot): boolean[] {
        const belegt = t.capacity - t.freeSpots;
        return Array.from({ length: t.capacity }, (_, i) => i < belegt);
    }

    protected belegungText(t: Slot): string {
        const belegt = t.capacity - t.freeSpots;
        return `${belegt} von ${t.capacity} ${t.capacity === 1 ? 'Platz' : 'Plätzen'} belegt`;
    }
}