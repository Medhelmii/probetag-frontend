import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Slot, SlotSearch } from '../models/slot.models';

@Injectable({ providedIn: 'root' })
export class SlotService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/slots`;

    search(filter: SlotSearch = {}): Observable<Slot[]> {
        let params = new HttpParams();
        if (filter.city?.trim()) {
            params = params.set('city', filter.city.trim());
        }
        if (filter.sector?.trim()) {
            params = params.set('sector', filter.sector.trim());
        }
        return this.http.get<Slot[]>(this.url, { params });
    }

    findById(id: string): Observable<Slot> {
        return this.http.get<Slot>(`${this.url}/${id}`);
    }
}