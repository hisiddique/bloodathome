import { useState, useEffect, useRef } from 'react';
import { Check, CreditCard, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { StepBackLink } from './step-back-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useBooking } from '@/contexts/booking-context';
import { useBookingApi, BookingApiError } from '@/hooks/use-booking-api';
import { usePage } from '@inertiajs/react';
import { StripePaymentForm } from './stripe-payment-form';
import { type UserPaymentMethod, type PageProps } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StepPaymentProps {
    stripePublicKey: string;
    userPaymentMethods?: UserPaymentMethod[];
}

export function StepPayment({ stripePublicKey, userPaymentMethods = [] }: StepPaymentProps) {
    const {
        selectedServices,
        bookedServices,
        collectionType,
        location,
        selectedDate,
        selectedSlot,
        selectedProvider,
        patientDetails,
        draftId,
        paymentIntentClientSecret,
        promoCode,
        discount,
        totalAmount,
        setDraftId,
        setPaymentIntentClientSecret,
        setTotalAmount,
        setPromoCode,
        setDiscount,
        setStep,
        goBack,
        setConfirmationNumber,
        clearBooking,
        isNhsTest,
    } = useBooking();

    const { createDraft, createPaymentIntent, applyPromoCode, confirmBooking } = useBookingApi();
    const { auth } = usePage<PageProps>().props;
    const isAuthenticated = !!auth?.user;

    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
    const [useNewCard, setUseNewCard] = useState(userPaymentMethods.length === 0);
    const [promoCodeInput, setPromoCodeInput] = useState(promoCode || '');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const draftCreationRef = useRef(false);

    // Pre-select default payment method
    useEffect(() => {
        if (userPaymentMethods.length > 0 && !selectedPaymentMethodId) {
            const defaultMethod = userPaymentMethods.find((pm) => pm.is_default);
            if (defaultMethod) {
                setSelectedPaymentMethodId(defaultMethod.id);
                setUseNewCard(false);
            }
        }
    }, [userPaymentMethods]);

    // Create draft and payment intent when ready
    useEffect(() => {
        const canCreateDraft = selectedDate && location && patientDetails && selectedSlot && selectedProvider && selectedServices.length > 0;
        const isReady = isAuthenticated || patientDetails?.isGuest;

        if (!draftCreationRef.current && canCreateDraft && isReady) {
            if (!draftId) {
                // No draft yet — create draft + payment intent
                draftCreationRef.current = true;
                handleCreateDraft().catch(() => {
                    draftCreationRef.current = false;
                });
            } else if (!paymentIntentClientSecret) {
                // Draft exists but payment intent lost (e.g., page reload) — re-create it
                draftCreationRef.current = true;
                handleCreatePaymentIntent(draftId).catch(() => {
                    draftCreationRef.current = false;
                });
            } else {
                // Both draft and payment intent exist — mark as attempted to prevent re-runs
                draftCreationRef.current = true;
            }
        }
    }, [draftId, paymentIntentClientSecret, selectedDate, location, patientDetails, selectedSlot, selectedProvider, selectedServices, isAuthenticated]);

    const handleCreateDraft = async () => {
        if (!selectedDate || !location || !patientDetails || !selectedSlot || !selectedProvider || selectedServices.length === 0) return;

        try {
            const draftData: any = {
                collection_type: collectionType || 'home_visit',
                is_nhs_test: isNhsTest,
                is_guest_booking: !isAuthenticated,
                service_ids: (bookedServices.length > 0 ? bookedServices : selectedServices).map((s) => s.id),
                location: {
                    postcode: location.postcode,
                    address: location.address,
                    address_line1: location.addressLine1,
                    address_line2: location.addressLine2,
                    city: location.townCity,
                },
                selected_date: format(selectedDate, 'yyyy-MM-dd'),
                time_slot: selectedSlot.time,
                provider_id: selectedProvider?.id,
                patient_details: {
                    first_name: patientDetails.firstName,
                    last_name: patientDetails.lastName,
                    email: patientDetails.email,
                    phone: patientDetails.phone,
                    date_of_birth: patientDetails.dateOfBirth,
                    nhs_number: patientDetails.nhsNumber,
                    is_under_16: patientDetails.isUnder16,
                    guardian_name: patientDetails.guardianName,
                    guardian_confirmed: patientDetails.guardianConfirmed,
                    notes: patientDetails.notes,
                },
            };

            // Add full address fields (required for KYC)
            if (location.addressLine1) {
                draftData.service_address_line1 = location.addressLine1;
                draftData.service_address_line2 = location.addressLine2 || null;
                draftData.service_town_city = location.townCity;
                draftData.service_postcode = location.postcode;
            }

            // Add guest fields for guest bookings
            if (!isAuthenticated) {
                draftData.guest_name = `${patientDetails.firstName} ${patientDetails.lastName}`;
                draftData.guest_email = patientDetails.email;
                draftData.guest_phone = patientDetails.phone;
            }

            console.log('[DEBUG] Draft data being sent:', {
                is_nhs_test: draftData.is_nhs_test,
                nhs_number: draftData.patient_details?.nhs_number,
                isNhsTest_context: isNhsTest,
                patientDetails_nhsNumber: patientDetails.nhsNumber,
            });

            const draft = await createDraft(draftData);

            setDraftId(draft.id);

            // Create payment intent
            await handleCreatePaymentIntent(draft.id);
        } catch (error: any) {
            console.error('[DEBUG] Draft creation error:', error);
            toast.error(error?.message || 'Failed to prepare payment. Please try again.');
            if (error instanceof BookingApiError && error.errorCode === 'DRAFT_EXPIRED') {
                clearBooking();
            } else {
                setStep('patient');
            }
        }
    };

    const handleCreatePaymentIntent = async (currentDraftId: string) => {
        setIsCreatingIntent(true);
        try {
            const { clientSecret, amount } = await createPaymentIntent(currentDraftId);
            setPaymentIntentClientSecret(clientSecret);
            // Amount is in pence, convert to pounds
            setTotalAmount(amount / 100);
        } catch (error: any) {
            console.error('Error creating payment intent:', error);
            toast.error(error?.message || 'Failed to initialize payment. Please try again.');
            if (error instanceof BookingApiError && error.errorCode === 'DRAFT_EXPIRED') {
                clearBooking();
            }
        } finally {
            setIsCreatingIntent(false);
        }
    };

    const handleApplyPromoCode = async () => {
        if (!promoCodeInput.trim() || !draftId) {
            toast.error('Please enter a promo code');
            return;
        }

        setIsApplyingPromo(true);
        try {
            const result = await applyPromoCode(draftId, promoCodeInput.trim());
            setPromoCode(result.code);
            setDiscount(result.discount);
            toast.success(`Promo code applied! £${result.discount.toFixed(2)} discount`);
        } catch (error: any) {
            toast.error(error.message || 'Invalid promo code');
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!draftId) {
            toast.error('Booking information missing');
            return;
        }

        setIsConfirming(true);
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await confirmBooking(paymentIntentId, draftId);
                if (result.confirmationNumber) {
                    setConfirmationNumber(result.confirmationNumber);
                }
                setStep('success');
                return;
            } catch (error: any) {
                lastError = error;
                console.error(`Confirm booking attempt ${attempt}/${maxRetries} failed:`, error?.message);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                }
            }
        }

        console.error('Error confirming booking after retries:', lastError);
        toast.error(
            'Payment succeeded but booking confirmation failed. Please contact support with your payment reference.',
            { duration: 15000 }
        );
        setIsConfirming(false);
    };

    const handlePaymentError = (error: string) => {
        console.error('Payment error:', error);
        toast.error(error);
    };

    // Use payment amount from backend (already includes fees, VAT, discounts)
    const finalTotal = totalAmount;

    if (isCreatingIntent) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Preparing payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <StepBackLink label="Back to Patient Details" onClick={goBack} />
                <h1 className="text-2xl font-semibold text-foreground mb-2">Payment</h1>
                <p className="text-muted-foreground">Complete your payment</p>
            </div>

            {/* Payment Section */}
                    {/* Promo Code */}
                    {!discount && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Promo Code</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Enter code"
                                        value={promoCodeInput}
                                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleApplyPromoCode}
                                    disabled={isApplyingPromo || !promoCodeInput.trim()}
                                >
                                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Payment Method Selection */}
                    {userPaymentMethods.length > 0 && !useNewCard && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground">Saved Payment Methods</label>
                            <div className="space-y-2">
                                {userPaymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setSelectedPaymentMethodId(method.id)}
                                        className={cn(
                                            'w-full p-4 rounded-xl border-2 transition-all text-left',
                                            selectedPaymentMethodId === method.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium text-foreground capitalize">
                                                        {method.card_brand} •••• {method.card_last_four}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Expires {method.card_exp_month}/{method.card_exp_year}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedPaymentMethodId === method.id && (
                                                <Check className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUseNewCard(true)}
                                className="w-full"
                            >
                                Use a different card
                            </Button>

                            {/* Terms & Conditions */}
                            <div className="flex items-start gap-3 p-4 bg-accent/30 rounded-xl border border-border mt-4">
                                <Checkbox
                                    id="terms-saved"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                    className="mt-0.5"
                                />
                                <label htmlFor="terms-saved" className="text-sm text-muted-foreground cursor-pointer">
                                    I confirm that all booking information is correct and I accept the{' '}
                                    <a href="/terms" target="_blank" className="text-primary hover:underline">
                                        terms and conditions
                                    </a>{' '}
                                    and{' '}
                                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                                        privacy policy
                                    </a>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* New Card Payment */}
                    {(useNewCard || userPaymentMethods.length === 0) && (
                        <div className="space-y-4">
                            {userPaymentMethods.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground">Card Details</label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setUseNewCard(false)}
                                        className="text-xs"
                                    >
                                        Use saved card
                                    </Button>
                                </div>
                            )}

                            {paymentIntentClientSecret && (
                                <StripePaymentForm
                                    clientSecret={paymentIntentClientSecret}
                                    amount={finalTotal}
                                    stripePublicKey={stripePublicKey}
                                    termsAccepted={termsAccepted}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    onPaymentError={handlePaymentError}
                                >
                                    {/* Terms & Conditions - Between card form and pay button */}
                                    <div className="flex items-start gap-3 p-4 bg-accent/30 rounded-xl border border-border">
                                        <Checkbox
                                            id="terms"
                                            checked={termsAccepted}
                                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                            className="mt-0.5"
                                        />
                                        <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                                            I confirm that all booking information is correct and I accept the{' '}
                                            <a href="/terms" target="_blank" className="text-primary hover:underline">
                                                terms and conditions
                                            </a>{' '}
                                            and{' '}
                                            <a href="/privacy" target="_blank" className="text-primary hover:underline">
                                                privacy policy
                                            </a>
                                        </label>
                                    </div>
                                </StripePaymentForm>
                            )}
                        </div>
                    )}

            {/* Actions (for saved payment methods) */}
            {!useNewCard && userPaymentMethods.length > 0 && (
                <div className="pt-4 space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                        Saved card payments coming soon. Please use a new card for now.
                    </p>
                    <Button
                        onClick={() => setUseNewCard(true)}
                        variant="outline"
                        className="w-full py-6 text-base"
                        size="lg"
                    >
                        Enter Card Details
                    </Button>
                </div>
            )}
        </div>
    );
}
