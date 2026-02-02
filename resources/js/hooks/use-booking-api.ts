import { type Service, type Provider, type TimeSlot, type BookingDraft, type CollectionType } from '@/types';
import { type BookingLocation, type PatientDetailsData } from '@/contexts/booking-context';

interface SearchProvidersParams {
    lat: number;
    lng: number;
    service_ids?: string[];
    collection_type?: string;
    date?: string;
    radius_km?: number;
}

interface CreateDraftData {
    collection_type: string;
    is_nhs_test: boolean;
    service_ids: string[];
    location?: BookingLocation;
    selected_date?: string;
    time_of_day?: string;
    provider_id?: string;
    patient_details?: PatientDetailsData;
}

interface PaymentIntentResponse {
    clientSecret: string;
    amount: number;
}

interface ConfirmBookingResponse {
    bookingId: string;
    confirmationNumber: string;
}

interface ApplyPromoCodeResponse {
    discount: number;
    newTotal: number;
    code: string;
}

function getCsrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta?.getAttribute('content') || '';
}

export function useBookingApi() {
    const fetchServices = async (collectionType?: string): Promise<Service[]> => {
        try {
            const url = collectionType
                ? `/api/services?collection_type=${collectionType}`
                : '/api/services';

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }

            const data = await response.json();
            return data.services || data;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    };

    const fetchCollectionTypes = async (): Promise<CollectionType[]> => {
        try {
            const response = await fetch('/api/collection-types', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch collection types');
            }

            const data = await response.json();
            return data.collectionTypes || data;
        } catch (error) {
            console.error('Error fetching collection types:', error);
            throw error;
        }
    };

    const searchProviders = async (params: SearchProvidersParams): Promise<Provider[]> => {
        try {
            const queryParams = new URLSearchParams({
                lat: params.lat.toString(),
                lng: params.lng.toString(),
            });

            if (params.service_ids && params.service_ids.length > 0) {
                params.service_ids.forEach((id) => queryParams.append('service_ids[]', id));
            }

            if (params.collection_type) {
                queryParams.append('collection_type', params.collection_type);
            }

            if (params.date) {
                queryParams.append('date', params.date);
            }

            if (params.radius_km) {
                queryParams.append('radius_km', params.radius_km.toString());
            }

            const response = await fetch(`/api/providers/search?${queryParams.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to search providers');
            }

            const data = await response.json();
            return data.providers || data;
        } catch (error) {
            console.error('Error searching providers:', error);
            throw error;
        }
    };

    const getProviderAvailability = async (providerId: string, date: string): Promise<TimeSlot[]> => {
        try {
            const response = await fetch(`/api/providers/${providerId}/availability?date=${date}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch provider availability');
            }

            const data = await response.json();
            return data.timeSlots || data;
        } catch (error) {
            console.error('Error fetching provider availability:', error);
            throw error;
        }
    };

    const createDraft = async (data: CreateDraftData): Promise<BookingDraft> => {
        try {
            const response = await fetch('/api/booking-drafts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create booking draft');
            }

            const responseData = await response.json();
            return responseData.draft || responseData;
        } catch (error) {
            console.error('Error creating booking draft:', error);
            throw error;
        }
    };

    const updateDraft = async (draftId: string, data: Partial<CreateDraftData>): Promise<BookingDraft> => {
        try {
            const response = await fetch(`/api/booking-drafts/${draftId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update booking draft');
            }

            const responseData = await response.json();
            return responseData.draft || responseData;
        } catch (error) {
            console.error('Error updating booking draft:', error);
            throw error;
        }
    };

    const createPaymentIntent = async (draftId: string): Promise<PaymentIntentResponse> => {
        try {
            const response = await fetch(`/api/booking-drafts/${draftId}/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create payment intent');
            }

            const data = await response.json();
            return {
                clientSecret: data.clientSecret,
                amount: data.amount,
            };
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    };

    const applyPromoCode = async (draftId: string, code: string): Promise<ApplyPromoCodeResponse> => {
        try {
            const response = await fetch(`/api/booking-drafts/${draftId}/promo-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid promo code');
            }

            const data = await response.json();
            return {
                discount: data.discount,
                newTotal: data.newTotal,
                code: data.code,
            };
        } catch (error) {
            console.error('Error applying promo code:', error);
            throw error;
        }
    };

    const confirmBooking = async (paymentIntentId: string, draftId: string): Promise<ConfirmBookingResponse> => {
        try {
            const response = await fetch('/api/bookings/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntentId,
                    draft_id: draftId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to confirm booking');
            }

            const data = await response.json();
            return {
                bookingId: data.bookingId,
                confirmationNumber: data.confirmationNumber,
            };
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    };

    return {
        fetchServices,
        fetchCollectionTypes,
        searchProviders,
        getProviderAvailability,
        createDraft,
        updateDraft,
        createPaymentIntent,
        applyPromoCode,
        confirmBooking,
    };
}
