import { renderHook } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios');

import { useBookingApi } from './use-booking-api';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useBookingApi', () => {
    describe('createDraft', () => {
        it('sends correct payload and maps response to BookingDraft shape', async () => {
            const mockResponse = {
                data: {
                    data: {
                        booking_id: 'draft-123',
                        draft_token: 'tok-abc',
                        total_cost: 5000,
                        expires_at: '2026-03-15T10:00:00Z',
                    },
                },
            };
            (axios.post as any).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useBookingApi());

            const draftData = {
                collection_type: 'home_visit',
                is_nhs_test: false,
                is_guest_booking: false,
                service_ids: ['svc-1'],
                provider_id: 'provider-1',
            };

            const draft = await result.current.createDraft(draftData as any);

            expect(axios.post).toHaveBeenCalledWith('/api/booking-drafts', draftData);
            expect(draft.id).toBe('draft-123');
            expect(draft.session_token).toBe('tok-abc');
            expect(draft.total_amount).toBe(5000);
            expect(draft.expires_at).toBe('2026-03-15T10:00:00Z');
        });
    });

    describe('createPaymentIntent', () => {
        it('marks error as isExpired when response message contains "expired"', async () => {
            (axios.post as any).mockRejectedValue({
                response: {
                    data: {
                        message: 'Draft has expired',
                    },
                },
            });

            const { result } = renderHook(() => useBookingApi());

            await expect(result.current.createPaymentIntent('draft-123')).rejects.toMatchObject({
                message: 'Draft has expired',
                isExpired: true,
            });
        });

        it('does not mark error as isExpired for non-expiry errors', async () => {
            (axios.post as any).mockRejectedValue({
                response: {
                    data: {
                        message: 'Server error occurred',
                    },
                },
            });

            const { result } = renderHook(() => useBookingApi());

            await expect(result.current.createPaymentIntent('draft-123')).rejects.toMatchObject({
                message: 'Server error occurred',
            });

            await expect(result.current.createPaymentIntent('draft-123')).rejects.not.toMatchObject({
                isExpired: true,
            });
        });
    });

    describe('searchProviders', () => {
        it('extracts 422 validation errors into a single message', async () => {
            (axios.post as any).mockRejectedValue({
                response: {
                    status: 422,
                    data: {
                        errors: {
                            latitude: ['The latitude field is required.'],
                            longitude: ['The longitude field is required.'],
                        },
                    },
                },
            });

            const { result } = renderHook(() => useBookingApi());

            await expect(
                result.current.searchProviders({ lat: 0, lng: 0 })
            ).rejects.toMatchObject({
                message: expect.stringContaining('latitude'),
            });
        });
    });

    describe('confirmBooking', () => {
        it('returns confirmationNumber from response', async () => {
            (axios.post as any).mockResolvedValue({
                data: {
                    data: {
                        booking: { id: 'booking-456' },
                        confirmation_number: 'BK-789012',
                    },
                },
            });

            const { result } = renderHook(() => useBookingApi());

            const response = await result.current.confirmBooking('pi_test_123', 'draft-123');

            expect(axios.post).toHaveBeenCalledWith('/api/bookings/confirm', {
                payment_intent_id: 'pi_test_123',
                draft_id: 'draft-123',
            });
            expect(response.confirmationNumber).toBe('BK-789012');
            expect(response.bookingId).toBe('booking-456');
        });
    });

    describe('applyPromoCode', () => {
        it('returns discount info from response', async () => {
            (axios.post as any).mockResolvedValue({
                data: {
                    discount: 15.0,
                    newTotal: 60.0,
                    code: 'SAVE15',
                },
            });

            const { result } = renderHook(() => useBookingApi());

            const response = await result.current.applyPromoCode('draft-123', 'SAVE15');

            expect(axios.post).toHaveBeenCalledWith('/api/booking-drafts/draft-123/promo-code', {
                code: 'SAVE15',
            });
            expect(response.discount).toBe(15.0);
            expect(response.newTotal).toBe(60.0);
            expect(response.code).toBe('SAVE15');
        });
    });
});
