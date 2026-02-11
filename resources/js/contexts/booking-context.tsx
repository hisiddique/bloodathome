import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Service, type Provider, type TimeSlot, type BookingStep, type BookingLocation } from '@/types';

export interface PatientDetailsData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nhsNumber?: string;
    isUnder16: boolean;
    guardianName?: string;
    guardianConfirmed?: boolean;
    notes?: string;
    isGuest?: boolean;
    dependentId?: string | null;
}

interface BookingState {
    step: BookingStep;

    // Step 1: Collection & Services
    collectionType: 'home_visit' | 'clinic' | null;
    isNhsTest: boolean;
    selectedServices: Service[];

    // Step 2: Location & Schedule
    location: BookingLocation | null;
    selectedDate: Date | null;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | null;
    selectedSlot: TimeSlot | null;

    // Step 3: Provider
    selectedProvider: Provider | null;
    bookedServices: Service[];
    providerServicePrices: Record<string, number>;

    // Step 4: Patient Details
    patientDetails: PatientDetailsData | null;

    // Step 5: Payment
    draftId: string | null;
    paymentIntentClientSecret: string | null;
    totalAmount: number;
    promoCode?: string;
    discount?: number;

    // Step 6: Success
    confirmationNumber: string | null;
}

interface BookingActions {
    setStep: (step: BookingStep) => void;
    setCollectionType: (type: 'home_visit' | 'clinic') => void;
    setIsNhsTest: (isNhs: boolean) => void;
    setSelectedServices: (services: Service[]) => void;
    addService: (service: Service) => void;
    removeService: (serviceId: string) => void;
    setLocation: (location: BookingLocation) => void;
    setSelectedDate: (date: Date) => void;
    setTimeOfDay: (timeOfDay: 'morning' | 'afternoon' | 'evening') => void;
    setSelectedSlot: (slot: TimeSlot | null) => void;
    setSelectedProvider: (provider: Provider) => void;
    setBookedServices: (services: Service[]) => void;
    setProviderServicePrices: (prices: Record<string, number>) => void;
    setPatientDetails: (details: PatientDetailsData) => void;
    setDraftId: (id: string) => void;
    setPaymentIntentClientSecret: (secret: string) => void;
    setTotalAmount: (amount: number) => void;
    setPromoCode: (code: string) => void;
    setDiscount: (discount: number) => void;
    setConfirmationNumber: (number: string) => void;
    clearBooking: () => void;
    goBack: () => void;
    goToStep: (step: BookingStep) => void;
}

type BookingContextType = BookingState & BookingActions;

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKING_STORAGE_KEY = 'bloodathome_booking_draft';
const DRAFT_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

const initialState: BookingState = {
    step: 'collection',
    collectionType: null,
    isNhsTest: false,
    selectedServices: [],
    location: null,
    selectedDate: null,
    timeOfDay: null,
    selectedSlot: null,
    selectedProvider: null,
    bookedServices: [],
    providerServicePrices: {},
    patientDetails: null,
    draftId: null,
    paymentIntentClientSecret: null,
    totalAmount: 0,
    promoCode: undefined,
    discount: undefined,
    confirmationNumber: null,
};

export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingState>(initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);

                // Check if draft has expired (1 hour)
                if (parsed._savedAt) {
                    const savedAt = new Date(parsed._savedAt).getTime();
                    const now = Date.now();
                    if (now - savedAt > DRAFT_EXPIRY_MS) {
                        // Draft expired, clear it
                        localStorage.removeItem(BOOKING_STORAGE_KEY);
                        setIsInitialized(true);
                        return;
                    }
                }

                // Restore dates as Date objects
                if (parsed.selectedDate) {
                    parsed.selectedDate = new Date(parsed.selectedDate);
                }

                // Remove metadata before setting state
                delete parsed._savedAt;

                setState({ ...initialState, ...parsed });
            }
        } catch (error) {
            console.error('Error loading booking draft:', error);
        }
        // Mark as initialized after loading attempt
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever state changes (only after initialization)
    useEffect(() => {
        // Don't save until we've loaded the existing draft
        if (!isInitialized) {
            return;
        }

        try {
            const toSave = {
                ...state,
                // Don't save payment secrets
                paymentIntentClientSecret: null,
                // Add timestamp for expiry check
                _savedAt: new Date().toISOString(),
            };
            localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving booking draft:', error);
        }
    }, [state, isInitialized]);

    const setStep = (step: BookingStep) => {
        setState((prev) => ({ ...prev, step }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setCollectionType = (type: 'home_visit' | 'clinic') => {
        setState((prev) => ({ ...prev, collectionType: type }));
    };

    const setIsNhsTest = (isNhs: boolean) => {
        setState((prev) => ({ ...prev, isNhsTest: isNhs }));
    };

    const setSelectedServices = (services: Service[]) => {
        setState((prev) => ({ ...prev, selectedServices: services }));
    };

    const addService = (service: Service) => {
        setState((prev) => ({
            ...prev,
            selectedServices: [...prev.selectedServices, service],
        }));
    };

    const removeService = (serviceId: string) => {
        setState((prev) => ({
            ...prev,
            selectedServices: prev.selectedServices.filter((s) => s.id !== serviceId),
        }));
    };

    const setLocation = (location: BookingLocation) => {
        setState((prev) => ({ ...prev, location }));
    };

    const setSelectedDate = (date: Date) => {
        setState((prev) => ({ ...prev, selectedDate: date }));
    };

    const setTimeOfDay = (timeOfDay: 'morning' | 'afternoon' | 'evening') => {
        setState((prev) => ({ ...prev, timeOfDay }));
    };

    const setSelectedSlot = (slot: TimeSlot | null) => {
        setState((prev) => ({ ...prev, selectedSlot: slot }));
    };

    const setSelectedProvider = (provider: Provider) => {
        setState((prev) => ({ ...prev, selectedProvider: provider }));
    };

    const setBookedServices = (services: Service[]) => {
        setState((prev) => ({ ...prev, bookedServices: services }));
    };

    const setProviderServicePrices = (prices: Record<string, number>) => {
        setState((prev) => ({ ...prev, providerServicePrices: prices }));
    };

    const setPatientDetails = (details: PatientDetailsData) => {
        setState((prev) => ({ ...prev, patientDetails: details }));
    };

    const setDraftId = (id: string) => {
        setState((prev) => ({ ...prev, draftId: id }));
    };

    const setPaymentIntentClientSecret = (secret: string) => {
        setState((prev) => ({ ...prev, paymentIntentClientSecret: secret }));
    };

    const setTotalAmount = (amount: number) => {
        setState((prev) => ({ ...prev, totalAmount: amount }));
    };

    const setPromoCode = (code: string) => {
        setState((prev) => ({ ...prev, promoCode: code }));
    };

    const setDiscount = (discount: number) => {
        setState((prev) => ({ ...prev, discount }));
    };

    const setConfirmationNumber = (number: string) => {
        setState((prev) => ({ ...prev, confirmationNumber: number }));
    };

    const clearBooking = () => {
        setState(initialState);
        localStorage.removeItem(BOOKING_STORAGE_KEY);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        const stepOrder: BookingStep[] = ['collection', 'location', 'provider', 'patient', 'payment', 'success'];
        const currentIndex = stepOrder.indexOf(state.step);
        if (currentIndex > 0) {
            const targetStep = stepOrder[currentIndex - 1];
            const updates: Partial<BookingState> = { step: targetStep };

            // Reset provider selection when going back to location or earlier
            const targetIndex = stepOrder.indexOf(targetStep);
            const providerIndex = stepOrder.indexOf('provider');
            if (targetIndex < providerIndex) {
                updates.selectedProvider = null;
                updates.selectedSlot = null;
                updates.bookedServices = [];
                updates.providerServicePrices = {};
            }

            setState((prev) => ({ ...prev, ...updates }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToStep = (step: BookingStep) => {
        const stepOrder: BookingStep[] = ['collection', 'location', 'provider', 'patient', 'payment', 'success'];
        const currentIndex = stepOrder.indexOf(state.step);
        const targetIndex = stepOrder.indexOf(step);

        // Only allow going to previous steps or the immediate next step
        if (targetIndex <= currentIndex) {
            const updates: Partial<BookingState> = { step };

            // Reset provider selection when going back to before provider step
            const providerIndex = stepOrder.indexOf('provider');
            if (targetIndex < providerIndex && currentIndex >= providerIndex) {
                updates.selectedProvider = null;
                updates.selectedSlot = null;
                updates.bookedServices = [];
                updates.providerServicePrices = {};
            }

            setState((prev) => ({ ...prev, ...updates }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const value: BookingContextType = {
        ...state,
        setStep,
        setCollectionType,
        setIsNhsTest,
        setSelectedServices,
        addService,
        removeService,
        setLocation,
        setSelectedDate,
        setTimeOfDay,
        setSelectedSlot,
        setSelectedProvider,
        setBookedServices,
        setProviderServicePrices,
        setPatientDetails,
        setDraftId,
        setPaymentIntentClientSecret,
        setTotalAmount,
        setPromoCode,
        setDiscount,
        setConfirmationNumber,
        clearBooking,
        goBack,
        goToStep,
    };

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}
