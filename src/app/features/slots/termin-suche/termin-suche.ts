import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { Slot } from '../../../core/models/slot.models';
import { SlotService } from '../../../core/services/slot.service';
import { Terminzettel } from '../../../shared/terminzettel/terminzettel';

type Zustand = 'laden' | 'fertig' | 'fehler';

@Component({
    selector: 'app-termin-suche',
    imports: [ReactiveFormsModule, Terminzettel],
    templateUrl: './termin-suche.html',
    styleUrl: './termin-suche.css',
})
export class TerminSuche {
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly slotService = inject(SlotService);

    protected readonly form = this.fb.nonNullable.group({
        city: [''],
        sector: [''],
    });

    protected readonly zustand = signal<Zustand>('laden');
    protected readonly termine = signal<Slot[]>([]);
    protected readonly hatFilter = signal(false);

    constructor() {
        // Immer wenn sich die Filter in der URL ändern: Formular füllen und neu suchen
        this.route.queryParamMap
            .pipe(
                map((params) => ({
                    city: params.get('city') ?? '',
                    sector: params.get('sector') ?? '',
                })),
                tap((filter) => {
                    this.form.setValue(filter);
                    this.hatFilter.set(filter.city !== '' || filter.sector !== '');
                    this.zustand.set('laden');
                }),
                switchMap((filter) =>
                    this.slotService.search(filter).pipe(
                        map((termine) => ({ ok: true, termine })),
                        catchError(() => of({ ok: false, termine: [] as Slot[] })),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((ergebnis) => {
                this.termine.set(ergebnis.termine);
                this.zustand.set(ergebnis.ok ? 'fertig' : 'fehler');
            });
    }

    /** Schreibt die Filter in die URL. Den Rest erledigt der Code im Konstruktor. */
    protected suchen(): void {
        const { city, sector } = this.form.getRawValue();
        this.router.navigate([], {
            queryParams: { city: city.trim() || null, sector: sector.trim() || null },
        });
    }

    protected filterLoeschen(): void {
        this.router.navigate([], { queryParams: {} });
    }
}