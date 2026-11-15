import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SlotService } from '../../core/services/slot.service';
import { Terminzettel } from '../../shared/terminzettel/terminzettel';

@Component({
    selector: 'app-home',
    imports: [RouterLink, Terminzettel],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home {
    protected readonly authService = inject(AuthService);
    private readonly slotService = inject(SlotService);

    private readonly termine = toSignal(
        this.slotService.search().pipe(catchError(() => of([]))),
        { initialValue: [] },
    );

    protected readonly naechsteTermine = computed(() => this.termine().slice(0, 3));
}