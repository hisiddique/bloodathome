import { useState, useEffect } from 'react';
import { Check, CreditCard, Lock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useBooking } from '@/contexts/booking-context';
import { useBookingApi } from '@/hooks/use-booking-api';
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
        collectionType,
        location,
        selectedDate,
        timeOfDay,
        selectedProvider,
        patientDetails,
        draftId,
        paymentIntentClientSecret,
        promoCode,
        discount,
        setDraftId,
        setPaymentIntentClientSecret,
        setPromoCode,
        setDiscount,
        setStep,
        goBack,
        clearBooking,
    } = useBooking();

    const { createDraft, createPaymentIntent, applyPromoCode, confirmBooking } = useBookingApi();
    const { serviceFeePercentage, vatPercentage } = usePage<PageProps>().props;

    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
    const [useNewCard, setUseNewCard] = useState(userPaymentMethods.length === 0);
    const [promoCodeInput, setPromoCodeInput] = useState(promoCode || '');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

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

    // Create draft and payment intent on mount
    useEffect(() => {
        if (!draftId && selectedDate && location && patientDetails) {
            handleCreateDraft();
        }
    }, []);

    const handleCreateDraft = async () => {
        if (!selectedDate || !location || !patientDetails) return;

        try {
            const draft = await createDraft({
                collection_type: collectionType || 'home_visit',
                is_nhs_test: false, // Will get from context if needed
                service_ids: selectedServices.map((s) => s.id),
                location,
                selected_date: format(selectedDate, 'yyyy-MM-dd'),
                time_of_day: timeOfDay || undefined,
                provider_id: selectedProvider?.id,
                patient_details: patientDetails,
            });

            setDraftId(draft.id);

            // Create payment intent
            await handleCreatePaymentIntent(draft.id);
        } catch (error) {
            console.error('Error creating draft:', error);
            toast.error('Failed to prepare payment. Please try again.');
        }
    };

    const handleCreatePaymentIntent = async (currentDraftId: string) => {
        setIsCreatingIntent(true);
        try {
            const { clientSecret } = await createPaymentIntent(currentDraftId);
            setPaymentIntentClientSecret(clientSecret);
        } catch (error) {
            console.error('Error creating payment intent:', error);
            toast.error('Failed to initialize payment. Please try again.');
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
        try {
            await confirmBooking(paymentIntentId, draftId);
            toast.success('Booking confirmed!');
            setStep('success');
            clearBooking();
        } catch (error) {
            console.error('Error confirming booking:', error);
            toast.error('Payment succeeded but booking confirmation failed. Please contact support.');
        } finally {
            setIsConfirming(false);
        }
    };

    const handlePaymentError = (error: string) => {
        console.error('Payment error:', error);
        toast.error(error);
    };

    // Calculate costs
    const subtotal = selectedServices.reduce((sum, service) => sum + (service.base_price || 0), 0);
    const serviceFee = subtotal * (serviceFeePercentage / 100);
    const vat = (subtotal + serviceFee) * (vatPercentage / 100);
    const totalBeforeDiscount = subtotal + serviceFee + vat;
    const finalTotal = discount ? totalBeforeDiscount - discount : totalBeforeDiscount;

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
                <h1 className="text-2xl font-semibold text-foreground mb-2">Payment</h1>
                <p className="text-muted-foreground">Review your booking and complete payment</p>
            </div>

            {/* Order Summary */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Order Summary</h3>

                {/* Provider Info */}
                {selectedProvider && (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        {selectedProvider.user.profile_image ? (
                            <img
                                src={selectedProvider.user.profile_image}
                                alt={selectedProvider.user.full_name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-semibold text-primary">
                                    {selectedProvider.user.full_name.charAt(0)}
                                </span>
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-foreground">{selectedProvider.user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{selectedProvider.type.name}</p>
                        </div>
                    </div>
                )}

                {/* Date & Location */}
                <div className="space-y-2 text-sm pb-4 border-b border-border">
                    {selectedDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date & Time</span>
                            <span className="text-foreground">
                                {format(selectedDate, 'EEE, dd MMM yyyy')} • {timeOfDay}
                            </span>
                        </div>
                    )}
                    {location && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="text-foreground">{location.postcode}</span>
                        </div>
                    )}
                    {collectionType && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Collection Type</span>
                            <span className="text-foreground capitalize">{collectionType.replace('_', ' ')}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Selected Tests</h4>
                    {selectedServices.map((service) => (
                        <div key={service.id} className="flex justify-between text-sm">
                            <span className="text-foreground">{service.service_name}</span>
                            <span className="font-medium text-foreground">£{(service.base_price || 0).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Fee ({serviceFeePercentage}%)</span>
                        <span className="text-foreground">£{serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VAT ({vatPercentage}%)</span>
                        <span className="text-foreground">£{vat.toFixed(2)}</span>
                    </div>
                    {discount && discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 dark:text-green-400">Discount</span>
                            <span className="text-green-600 dark:text-green-400">-£{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">£{finalTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

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

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Lock className="w-4 h-4" />
                        <span>Secure payment powered by Stripe</span>
                    </div>

                    {paymentIntentClientSecret && (
                        <StripePaymentForm
                            clientSecret={paymentIntentClientSecret}
                            amount={finalTotal}
                            stripePublicKey={stripePublicKey}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                        />
                    )}
                </div>
            )}

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 p-4 bg-accent/30 rounded-xl border border-border">
                <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I accept the{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">
                        terms and conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                        privacy policy
                    </a>
                </label>
            </div>

            {/* Actions (for saved payment methods) */}
            {!useNewCard && userPaymentMethods.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={goBack} className="sm:w-auto w-full py-6">
                        Back
                    </Button>
                    <Button
                        onClick={() => {
                            // Handle saved payment method flow
                            toast.info('Saved payment method flow not yet implemented');
                        }}
                        disabled={!termsAccepted || !selectedPaymentMethodId || isConfirming}
                        className="flex-1 py-6 text-base"
                        size="lg"
                    >
                        {isConfirming ? 'Processing...' : `Pay £${finalTotal.toFixed(2)}`}
                    </Button>
                </div>
            )}

            {/* Back button for new card payment (already has submit in Stripe form) */}
            {(useNewCard || userPaymentMethods.length === 0) && (
                <div className="pt-4">
                    <Button type="button" variant="outline" onClick={goBack} className="w-full py-6">
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}
