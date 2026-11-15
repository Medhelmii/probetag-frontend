export type Role = 'PARTICIPANT' | 'COMPANY' | 'ADMIN';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterParticipantRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    motivation?: string;
}

export interface RegisterCompanyRequest {
    email: string;
    password: string;
    name: string;
    sector: string;
    address: string;
    city: string;
    postalCode: string;
    description?: string;
}

export interface AuthResponse {
    token: string;
    tokenType: string;
    expiresInSeconds: number;
    userId: string;
    email: string;
    role: Role;
}