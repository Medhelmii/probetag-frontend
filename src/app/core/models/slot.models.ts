export type SlotStatus = 'OPEN' | 'CANCELLED';

export interface Slot {
    id: string;
    jobTitle: string;
    description: string;
    startsAt: string; // ISO-Zeitpunkt in UTC, z. B. "2026-11-24T07:00:00Z"
    endsAt: string;
    capacity: number;
    freeSpots: number;
    dressCode: string | null;
    status: SlotStatus;
    companyId: string;
    companyName: string;
    sector: string;
    address: string;
    city: string;
}

export interface SlotSearch {
    city?: string;
    sector?: string;
}