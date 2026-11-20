export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'ATTENDED' | 'NO_SHOW';

export interface Booking {
    id: string;
    status: BookingStatus;
    bookedAt: string;
    slotId: string;
    jobTitle: string;
    startsAt: string;
    endsAt: string;
    dressCode: string | null;
    companyName: string;
    address: string;
    city: string;
    reviewed: boolean;
}