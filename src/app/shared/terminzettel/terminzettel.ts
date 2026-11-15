import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Slot } from '../../core/models/slot.models';
import { datumLang } from '../../core/utils/zeit';
import { ZollstockLeiste } from '../zollstock-leiste/zollstock-leiste';

@Component({
    selector: 'app-terminzettel',
    imports: [RouterLink, ZollstockLeiste],
    templateUrl: './terminzettel.html',
    styleUrl: './terminzettel.css',
})
export class Terminzettel {
    readonly slot = input.required<Slot>();

    protected readonly datum = computed(() => datumLang(this.slot().startsAt));

    protected readonly platzText = computed(() => {
        const frei = this.slot().freeSpots;
        if (frei === 0) {
            return 'Ausgebucht';
        }
        return frei === 1 ? '1 Platz frei' : `${frei} Plätze frei`;
    });

    protected readonly ausgebucht = computed(() => this.slot().freeSpots === 0);
}