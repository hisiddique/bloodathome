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
    location?: {
        postcode: string;
        address?: string;
        address_line1?: string;
        address_line2?: string;
        city?: string;
    };
    service_address_line1?: string;
    service_address_line2?: string;
    service_town_city?: string;
    service_postcode?: string;
    selected_date?: string;
    time_slot?: string;
    provider_id: string;
    patient_details?: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        date_of_birth: string;
        nhs_number?: string;
        is_under_16?: boolean;
        guardian_name?: string;
        guardian_confirmed?: boolean;
        notes?: string;
    };
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
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
            const response = await fetch('/api/providers/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    latitude: params.lat,
                    longitude: params.lng,
                    service_ids: params.service_ids,
                    collection_type: params.collection_type,
                    radius_km: params.radius_km,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Provider search failed:', response.status, errorData);

                // For 422 validation errors, build a readable message from field errors
                if (response.status === 422 && errorData.errors) {
                    const fieldErrors = Object.values(errorData.errors).flat().join('. ');
                    throw new Error(fieldErrors || errorData.message || 'Validation failed');
                }

                throw new Error(errorData.message || `Failed to search providers (${response.status})`);
            }

            const responseData = await response.json();
            return responseData.data?.providers || responseData.providers || [];
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

            const responseData = await response.json();
            return responseData.data?.slots || responseData.slots || [];
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
            return {
                id: responseData.data?.booking_id,
                session_token: responseData.data?.draft_token,
                total_amount: responseData.data?.total_cost,
                expires_at: responseData.data?.expires_at,
            };
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
            const response = await fetch('/api/booking-drafts/payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ booking_id: draftId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create payment intent');
            }

            const responseData = await response.json();
            return {
                clientSecret: responseData.data?.client_secret,
                amount: responseData.data?.amount,
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

            const responseData = await response.json();
            return {
                bookingId: responseData.data?.booking?.id,
                confirmationNumber: responseData.data?.confirmation_number,
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
