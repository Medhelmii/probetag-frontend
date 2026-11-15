import { Component, computed, input } from '@angular/core';
import { alsUhrzeit, stundeInBerlin } from '../../core/utils/zeit';

interface Beschriftung {
    stunde: number;
    text: string;
    links: number; // Position in Prozent
    wichtig: boolean;
}

@Component({
    selector: 'app-zollstock-leiste',
    templateUrl: './zollstock-leiste.html',
    styleUrl: './zollstock-leiste.css',
})
export class ZollstockLeiste {
    readonly startsAt = input.required<string>();
    readonly endsAt = input.required<string>();

    private readonly beginn = computed(() => stundeInBerlin(this.startsAt()));
    // Endet der Termin nach Mitternacht (z. B. Nachtschicht), gehört das Ende zum nächsten Tag
    private readonly ende = computed(() => {
        const e = stundeInBerlin(this.endsAt());
        return e <= this.beginn() ? e + 24 : e;
    });

    // Die Skala geht von 7 bis 18 Uhr, wird aber länger, wenn ein Termin früher oder später liegt
    private readonly skalaStart = computed(() => Math.min(7, Math.floor(this.beginn())));
    private readonly skalaEnde = computed(() => Math.max(18, Math.ceil(this.ende())));
    protected readonly stunden = computed(() => this.skalaEnde() - this.skalaStart());

    protected readonly links = computed(
        () => ((this.beginn() - this.skalaStart()) / this.stunden()) * 100,
    );
    protected readonly breite = computed(
        () => ((this.ende() - this.beginn()) / this.stunden()) * 100,
    );

    protected readonly beschreibung = computed(
        () => `Von ${alsUhrzeit(this.beginn())} bis ${alsUhrzeit(this.ende())} Uhr`,
    );

    /** Beginn und Ende fett; die Enden der Skala nur, wenn sie nicht zu nah daran liegen. */
    protected readonly beschriftungen = computed<Beschriftung[]>(() => {
        const pos = (stunde: number) => ((stunde - this.skalaStart()) / this.stunden()) * 100;
        const wichtige = [this.beginn(), this.ende()];
        const liste: Beschriftung[] = wichtige.map((s) => ({
            stunde: s,
            text: alsUhrzeit(s),
            links: pos(s),
            wichtig: true,
        }));

        for (const s of [this.skalaStart(), this.skalaEnde()]) {
            const zuNah = wichtige.some((w) => Math.abs(w - s) < 1.5);
            if (!zuNah) {
                liste.push({ stunde: s, text: String(s % 24), links: pos(s), wichtig: false });
            }
        }
        return liste;
    });
}