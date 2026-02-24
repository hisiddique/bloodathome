import { vi } from 'vitest';
import { type PatientDetailsData } from '@/contexts/booking-context';
import { type BookingStep } from '@/types';

export interface MockDependent {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    relationship: string;
    nhs_number?: string;
}

export interface MockUserData {
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    nhs_number?: string;
}

export function createMockUserData(overrides: Partial<MockUserData> = {}): MockUserData {
    return {
        name: 'John Smith',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        phone: '07123456789',
        date_of_birth: '1990-05-15',
        nhs_number: undefined,
        ...overrides,
    };
}

export function createMockDependent(overrides: Partial<MockDependent> = {}): MockDependent {
    return {
        id: 'dep-1',
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith',
        date_of_birth: '2005-03-10',
        relationship: 'child',
        nhs_number: undefined,
        ...overrides,
    };
}

export function createMockBookingContext(overrides: Record<string, any> = {}) {
    return {
        // State
        step: 'patient' as BookingStep,
        collectionType: 'home_visit' as const,
        isNhsTest: false,
        selectedServices: [],
        location: {
            postcode: 'SW1A 1AA',
            lat: 51.501,
            lng: -0.1415,
            address: '10 Downing Street, London',
            addressLine1: '10 Downing Street',
            addressLine2: undefined,
            townCity: 'London',
        },
        selectedDate: new Date('2026-03-15'),
        timeOfDay: 'morning' as const,
        selectedSlot: { time: '09:00', available: true },
        selectedProvider: {
            id: 'provider-1',
            user: {
                first_name: 'Dr',
                last_name: 'Jones',
                full_name: 'Dr Jones',
            },
            type: { id: 1, name: 'Phlebotomist' },
            latitude: 51.5,
            longitude: -0.1,
            average_rating: 4.8,
            total_reviews: 50,
            show_image_in_search: false,
        },
        bookedServices: [],
        providerServicePrices: {},
        patientDetails: null as PatientDetailsData | null,
        draftId: null as string | null,
        paymentIntentClientSecret: null as string | null,
        totalAmount: 75,
        promoCode: undefined,
        discount: undefined,
        confirmationNumber: null,

        // Actions
        setStep: vi.fn(),
        setCollectionType: vi.fn(),
        setIsNhsTest: vi.fn(),
        setSelectedServices: vi.fn(),
        addService: vi.fn(),
        removeService: vi.fn(),
        setLocation: vi.fn(),
        setSelectedDate: vi.fn(),
        setTimeOfDay: vi.fn(),
        setSelectedSlot: vi.fn(),
        setSelectedProvider: vi.fn(),
        setBookedServices: vi.fn(),
        setProviderServicePrices: vi.fn(),
        setPatientDetails: vi.fn(),
        setDraftId: vi.fn(),
        setPaymentIntentClientSecret: vi.fn(),
        setTotalAmount: vi.fn(),
        setPromoCode: vi.fn(),
        setDiscount: vi.fn(),
        setConfirmationNumber: vi.fn(),
        clearBooking: vi.fn(),
        goBack: vi.fn(),
        goToStep: vi.fn(),

        ...overrides,
    };
}
