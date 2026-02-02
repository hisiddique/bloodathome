import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Service, type Provider, type TimeSlot, type BookingStep } from '@/types';

export interface BookingLocation {
    postcode: string;
    lat: number;
    lng: number;
    address?: string;
}

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

    // Step 4: Patient Details
    patientDetails: PatientDetailsData | null;

    // Step 5: Payment
    draftId: string | null;
    paymentIntentClientSecret: string | null;
    totalAmount: number;
    promoCode?: string;
    discount?: number;
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
    setSelectedSlot: (slot: TimeSlot) => void;
    setSelectedProvider: (provider: Provider) => void;
    setPatientDetails: (details: PatientDetailsData) => void;
    setDraftId: (id: string) => void;
    setPaymentIntentClientSecret: (secret: string) => void;
    setTotalAmount: (amount: number) => void;
    setPromoCode: (code: string) => void;
    setDiscount: (discount: number) => void;
    clearBooking: () => void;
    goBack: () => void;
    goToStep: (step: BookingStep) => void;
}

type BookingContextType = BookingState & BookingActions;

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKING_STORAGE_KEY = 'bloodathome_booking_draft';

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
    patientDetails: null,
    draftId: null,
    paymentIntentClientSecret: null,
    totalAmount: 0,
    promoCode: undefined,
    discount: undefined,
};

export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingState>(initialState);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Restore dates as Date objects
                if (parsed.selectedDate) {
                    parsed.selectedDate = new Date(parsed.selectedDate);
                }
                setState({ ...initialState, ...parsed });
            }
        } catch (error) {
            console.error('Error loading booking draft:', error);
        }
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        try {
            const toSave = {
                ...state,
                // Don't save payment secrets
                paymentIntentClientSecret: null,
            };
            localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving booking draft:', error);
        }
    }, [state]);

    const setStep = (step: BookingStep) => {
        setState((prev) => ({ ...prev, step }));
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

    const setSelectedSlot = (slot: TimeSlot) => {
        setState((prev) => ({ ...prev, selectedSlot: slot }));
    };

    const setSelectedProvider = (provider: Provider) => {
        setState((prev) => ({ ...prev, selectedProvider: provider }));
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

    const clearBooking = () => {
        setState(initialState);
        localStorage.removeItem(BOOKING_STORAGE_KEY);
    };

    const goBack = () => {
        const stepOrder: BookingStep[] = ['collection', 'location', 'provider', 'patient', 'payment', 'success'];
        const currentIndex = stepOrder.indexOf(state.step);
        if (currentIndex > 0) {
            setState((prev) => ({ ...prev, step: stepOrder[currentIndex - 1] }));
        }
    };

    const goToStep = (step: BookingStep) => {
        const stepOrder: BookingStep[] = ['collection', 'location', 'provider', 'patient', 'payment', 'success'];
        const currentIndex = stepOrder.indexOf(state.step);
        const targetIndex = stepOrder.indexOf(step);

        // Only allow going to previous steps or the immediate next step
        if (targetIndex <= currentIndex) {
            setState((prev) => ({ ...prev, step }));
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
        setPatientDetails,
        setDraftId,
        setPaymentIntentClientSecret,
        setTotalAmount,
        setPromoCode,
        setDiscount,
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
