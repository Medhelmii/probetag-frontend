import { Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';

@Component({
    selector: 'app-bewertungs-formular',
    imports: [ReactiveFormsModule],
    templateUrl: './bewertungs-formular.html',
    styleUrl: './bewertungs-formular.css',
})
export class BewertungsFormular {
    private readonly fb = inject(FormBuilder);
    private readonly bookingService = inject(BookingService);

    readonly bookingId = input.required<string>();
    readonly gespeichert = output<void>();
    readonly abgebrochen = output<void>();

    protected readonly punkte = [1, 2, 3, 4, 5];

    protected readonly form = this.fb.group({
        rating: this.fb.control<number | null>(null, Validators.required),
        comment: this.fb.nonNullable.control('', Validators.maxLength(1000)),
        interestedInJob: this.fb.nonNullable.control(false),
    });

    protected readonly laeuft = signal(false);
    protected readonly fehler = signal<string | null>(null);

    protected senden(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { rating, comment, interestedInJob } = this.form.getRawValue();
        this.laeuft.set(true);
        this.fehler.set(null);

        this.bookingService
            .review(this.bookingId(), {
                rating: rating!,
                comment: comment.trim() || undefined,
                interestedInJob,
            })
            .subscribe({
                next: () => this.gespeichert.emit(),
                error: (error: HttpErrorResponse) => {
                    this.laeuft.set(false);
                    this.fehler.set(
                        error.error?.detail ?? 'Die Bewertung konnte nicht gespeichert werden. Bitte versuch es noch einmal.',
                    );
                },
            });
    }
}