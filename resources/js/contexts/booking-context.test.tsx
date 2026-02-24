import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingProvider, useBooking } from './booking-context';

const STORAGE_KEY = 'bloodathome_booking_draft';
const DRAFT_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function wrapper({ children }: { children: React.ReactNode }) {
    return <BookingProvider>{children}</BookingProvider>;
}

describe('BookingProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('initializes with default state when localStorage is empty', () => {
        const { result } = renderHook(() => useBooking(), { wrapper });

        expect(result.current.step).toBe('collection');
        expect(result.current.collectionType).toBeNull();
        expect(result.current.isNhsTest).toBe(false);
        expect(result.current.selectedServices).toEqual([]);
        expect(result.current.location).toBeNull();
        expect(result.current.selectedDate).toBeNull();
        expect(result.current.selectedProvider).toBeNull();
        expect(result.current.patientDetails).toBeNull();
        expect(result.current.draftId).toBeNull();
        expect(result.current.paymentIntentClientSecret).toBeNull();
        expect(result.current.totalAmount).toBe(0);
        expect(result.current.confirmationNumber).toBeNull();
    });

    it('restores state from localStorage on mount', async () => {
        const savedState = {
            step: 'patient',
            collectionType: 'home_visit',
            isNhsTest: true,
            selectedServices: [],
            location: { postcode: 'SW1A 1AA', lat: 51.5, lng: -0.1 },
            selectedDate: new Date('2026-03-15').toISOString(),
            timeOfDay: 'morning',
            selectedSlot: { time: '09:00', available: true },
            selectedProvider: null,
            bookedServices: [],
            providerServicePrices: {},
            patientDetails: null,
            draftId: 'draft-123',
            paymentIntentClientSecret: null,
            totalAmount: 75,
            confirmationNumber: null,
            _savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

        const { result } = renderHook(() => useBooking(), { wrapper });

        // Wait for initialization effect to run
        await act(async () => {});

        expect(result.current.step).toBe('patient');
        expect(result.current.collectionType).toBe('home_visit');
        expect(result.current.isNhsTest).toBe(true);
        expect(result.current.draftId).toBe('draft-123');
        expect(result.current.totalAmount).toBe(75);
    });

    it('detects and resets expired drafts (older than 1 hour)', async () => {
        const expiredTime = new Date(Date.now() - DRAFT_EXPIRY_MS - 1000).toISOString();
        const expiredState = {
            step: 'payment',
            collectionType: 'home_visit',
            isNhsTest: false,
            draftId: 'draft-expired',
            _savedAt: expiredTime,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expiredState));

        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        // Should revert to initial state
        expect(result.current.step).toBe('collection');
        expect(result.current.draftId).toBeNull();
        // The save effect re-writes initialState back to localStorage, so check the saved step
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        expect(saved.step).toBe('collection');
    });

    it('sets sessionStorage flag when expired draft is detected', async () => {
        const expiredTime = new Date(Date.now() - DRAFT_EXPIRY_MS - 1000).toISOString();
        const expiredState = {
            step: 'payment',
            _savedAt: expiredTime,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expiredState));

        renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        expect(sessionStorage.getItem('booking_draft_expired')).toBe('true');
    });

    it('saves state to localStorage excluding paymentIntentClientSecret', async () => {
        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        await act(async () => {
            result.current.setPaymentIntentClientSecret('pi_secret_123');
        });

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        expect(saved.paymentIntentClientSecret).toBeNull();
    });

    it('saves state to localStorage with _savedAt timestamp', async () => {
        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        await act(async () => {
            result.current.setCollectionType('home_visit');
        });

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        expect(saved._savedAt).toBeDefined();
        expect(saved.collectionType).toBe('home_visit');
    });

    it('goBack from payment step navigates to patient', async () => {
        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        // Advance to payment step
        act(() => {
            result.current.setStep('payment');
        });

        act(() => {
            result.current.goBack();
        });

        expect(result.current.step).toBe('patient');
    });

    it('goBack resets provider data when crossing the provider step threshold', async () => {
        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        // Setup state at provider step
        act(() => {
            result.current.setStep('provider');
            result.current.setSelectedProvider({
                id: 'p-1',
                user: { first_name: 'Dr', last_name: 'Jones', full_name: 'Dr Jones' },
                type: { id: 1, name: 'Phlebotomist' },
                latitude: 51.5,
                longitude: -0.1,
                average_rating: 4.8,
                total_reviews: 50,
                show_image_in_search: false,
            });
        });

        // Go back from provider step (target = location, which is before provider)
        act(() => {
            result.current.goBack();
        });

        expect(result.current.step).toBe('location');
        expect(result.current.selectedProvider).toBeNull();
        expect(result.current.selectedSlot).toBeNull();
        expect(result.current.bookedServices).toEqual([]);
        expect(result.current.providerServicePrices).toEqual({});
    });

    it('goToStep prevents forward skipping', async () => {
        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        // Currently at 'collection', try to jump to 'payment' (skipping ahead)
        act(() => {
            result.current.goToStep('payment');
        });

        // Should remain at 'collection' because payment is ahead
        expect(result.current.step).toBe('collection');
    });

    it('goToStep allows going backward and resets provider when crossing threshold', async () => {
        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        // Advance to patient step
        act(() => {
            result.current.setStep('patient');
        });

        // Set a provider
        act(() => {
            result.current.setSelectedProvider({
                id: 'p-1',
                user: { first_name: 'Dr', last_name: 'Jones', full_name: 'Dr Jones' },
                type: { id: 1, name: 'Phlebotomist' },
                latitude: 51.5,
                longitude: -0.1,
                average_rating: 4.8,
                total_reviews: 50,
                show_image_in_search: false,
            });
        });

        // Jump back to location (before provider)
        act(() => {
            result.current.goToStep('location');
        });

        expect(result.current.step).toBe('location');
        expect(result.current.selectedProvider).toBeNull();
    });

    it('clearBooking resets all state and removes localStorage entry', async () => {
        const { result } = renderHook(() => useBooking(), { wrapper });
        await act(async () => {});

        // Set some state
        act(() => {
            result.current.setCollectionType('home_visit');
            result.current.setIsNhsTest(true);
        });

        // Clear everything
        act(() => {
            result.current.clearBooking();
        });

        expect(result.current.step).toBe('collection');
        expect(result.current.collectionType).toBeNull();
        expect(result.current.isNhsTest).toBe(false);
        // clearBooking removes localStorage, but the save effect re-writes initialState
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        expect(saved.step).toBe('collection');
        expect(saved.collectionType).toBeNull();
    });
});
