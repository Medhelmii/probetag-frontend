import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../models/booking.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
    private readonly http = inject(HttpClient);
    private readonly api = environment.apiUrl;

    book(slotId: string): Observable<Booking> {
        return this.http.post<Booking>(`${this.api}/slots/${slotId}/bookings`, null);
    }

    myBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.api}/participants/me/bookings`);
    }

    cancel(bookingId: string): Observable<Booking> {
        return this.http.post<Booking>(`${this.api}/bookings/${bookingId}/cancel`, null);
    }
}