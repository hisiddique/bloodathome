import axios from 'axios';
import { type Service, type Provider, type TimeSlot, type BookingDraft, type CollectionType } from '@/types';
import { type BookingLocation, type PatientDetailsData } from '@/contexts/booking-context';

export class BookingApiError extends Error {
    constructor(message: string, public readonly errorCode?: string) {
        super(message);
        this.name = 'BookingApiError';
    }
}

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
    is_guest_booking: boolean;
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

export function useBookingApi() {
    const fetchServices = async (collectionType?: string): Promise<Service[]> => {
        try {
            const url = collectionType
                ? `/api/services?collection_type=${collectionType}`
                : '/api/services';

            const { data } = await axios.get(url);
            return data.services || data;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    };

    const fetchCollectionTypes = async (): Promise<CollectionType[]> => {
        try {
            const { data } = await axios.get('/api/collection-types');
            return data.collectionTypes || data;
        } catch (error) {
            console.error('Error fetching collection types:', error);
            throw error;
        }
    };

    const searchProviders = async (params: SearchProvidersParams): Promise<Provider[]> => {
        try {
            const { data: responseData } = await axios.post('/api/providers/search', {
                latitude: params.lat,
                longitude: params.lng,
                service_ids: params.service_ids,
                collection_type: params.collection_type,
                radius_km: params.radius_km,
            });

            return responseData.data?.providers || responseData.providers || [];
        } catch (error: any) {
            console.error('Error searching providers:', error);

            if (error.response?.status === 422 && error.response?.data?.errors) {
                const fieldErrors = Object.values(error.response.data.errors).flat().join('. ');
                throw new Error(fieldErrors || error.response.data.message || 'Validation failed');
            }

            throw new Error(error.response?.data?.message || 'Failed to search providers');
        }
    };

    const getProviderAvailability = async (providerId: string, date: string): Promise<TimeSlot[]> => {
        try {
            const { data: responseData } = await axios.get(`/api/providers/${providerId}/availability`, {
                params: { date },
            });

            return responseData.data?.slots || responseData.slots || [];
        } catch (error) {
            console.error('Error fetching provider availability:', error);
            throw error;
        }
    };

    const createDraft = async (data: CreateDraftData): Promise<BookingDraft> => {
        try {
            const { data: responseData } = await axios.post('/api/booking-drafts', data);

            return {
                id: responseData.data?.booking_id,
                session_token: responseData.data?.draft_token,
                total_amount: responseData.data?.total_cost,
                expires_at: responseData.data?.expires_at,
            };
        } catch (error: any) {
            console.error('Error creating booking draft:', error);
            const responseData = error.response?.data;
            const errors = responseData?.errors;
            if (errors) {
                const firstError = Object.values(errors).flat()[0] as string;
                throw new BookingApiError(firstError || 'Failed to create booking draft');
            }
            throw new BookingApiError(
                responseData?.message || 'Failed to create booking draft',
                responseData?.error_code,
            );
        }
    };

    const updateDraft = async (draftId: string, data: Partial<CreateDraftData>): Promise<BookingDraft> => {
        try {
            const { data: responseData } = await axios.patch(`/api/booking-drafts/${draftId}`, data);

            return responseData.draft || responseData;
        } catch (error: any) {
            console.error('Error updating booking draft:', error);
            throw new Error(error.response?.data?.message || 'Failed to update booking draft');
        }
    };

    const createPaymentIntent = async (draftId: string): Promise<PaymentIntentResponse> => {
        try {
            const { data: responseData } = await axios.post('/api/booking-drafts/payment-intent', {
                booking_id: draftId,
            });

            return {
                clientSecret: responseData.data?.client_secret,
                amount: responseData.data?.amount,
            };
        } catch (error: any) {
            console.error('Error creating payment intent:', error);
            const responseData = error.response?.data;
            throw new BookingApiError(
                responseData?.message || 'Failed to create payment intent',
                responseData?.error_code,
            );
        }
    };

    const applyPromoCode = async (draftId: string, code: string): Promise<ApplyPromoCodeResponse> => {
        try {
            const { data } = await axios.post(`/api/booking-drafts/${draftId}/promo-code`, { code });

            return {
                discount: data.discount,
                newTotal: data.newTotal,
                code: data.code,
            };
        } catch (error: any) {
            console.error('Error applying promo code:', error);
            throw new Error(error.response?.data?.message || 'Invalid promo code');
        }
    };

    const confirmBooking = async (paymentIntentId: string, draftId: string): Promise<ConfirmBookingResponse> => {
        try {
            const { data: responseData } = await axios.post('/api/bookings/confirm', {
                payment_intent_id: paymentIntentId,
                draft_id: draftId,
            });

            return {
                bookingId: responseData.data?.booking?.id,
                confirmationNumber: responseData.data?.confirmation_number,
            };
        } catch (error: any) {
            console.error('Error confirming booking:', error);
            const responseData = error.response?.data;
            throw new BookingApiError(
                responseData?.message || 'Failed to confirm booking',
                responseData?.error_code,
            );
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
