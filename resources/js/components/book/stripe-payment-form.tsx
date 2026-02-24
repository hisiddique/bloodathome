import { useState, useEffect, useRef, useMemo } from 'react';
import { loadStripe, type Stripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Cache Stripe instance at module level to avoid re-creating on every mount
let stripePromiseCache: Promise<Stripe | null> | null = null;
let cachedKey = '';

function getStripePromise(publicKey: string): Promise<Stripe | null> {
    if (stripePromiseCache && cachedKey === publicKey) {
        return stripePromiseCache;
    }
    cachedKey = publicKey;
    stripePromiseCache = loadStripe(publicKey);
    return stripePromiseCache;
}

interface StripePaymentFormProps {
    clientSecret: string;
    amount: number;
    stripePublicKey: string;
    termsAccepted?: boolean;
    onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
    onPaymentError: (error: string) => void;
    children?: React.ReactNode;
}

function PaymentForm({
    amount,
    termsAccepted = true,
    onPaymentSuccess,
    onPaymentError,
    children,
}: {
    amount: number;
    termsAccepted?: boolean;
    onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
    onPaymentError: (error: string) => void;
    children?: React.ReactNode;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isElementReady, setIsElementReady] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (isProcessing) return;

        setIsProcessing(true);

        try {
            // Validate payment details before confirming
            const { error: submitError } = await elements.submit();
            if (submitError) {
                if (submitError.type !== 'validation_error') {
                    onPaymentError(submitError.message || 'Please check your payment details.');
                }
                return;
            }

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/book/success`,
                },
                redirect: 'if_required',
            });

            if (!mountedRef.current) return;

            if (error) {
                if (error.type === 'validation_error') {
                    // Stripe displays these inline — don't duplicate
                } else {
                    onPaymentError(error.message || 'Payment failed');
                }
            } else if (paymentIntent) {
                if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
                    // Wrap onPaymentSuccess with a timeout to prevent infinite hang
                    let timeoutId: ReturnType<typeof setTimeout> | undefined;
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        timeoutId = setTimeout(() => reject(new Error('Booking confirmation timed out')), 30000);
                    });

                    try {
                        await Promise.race([
                            onPaymentSuccess(paymentIntent.id),
                            timeoutPromise,
                        ]);
                    } catch (callbackErr: any) {
                        if (!mountedRef.current) return;
                        const msg = callbackErr?.message || 'Booking confirmation failed';
                        if (msg.includes('timed out')) {
                            toast.error(
                                'Payment succeeded but confirmation is taking longer than expected. Please check your bookings or contact support.',
                                { duration: 15000 },
                            );
                        } else {
                            toast.error(msg);
                        }
                    } finally {
                        clearTimeout(timeoutId);
                    }
                } else if (paymentIntent.status === 'requires_action') {
                    onPaymentError('Additional authentication is required. Please try again.');
                } else {
                    onPaymentError(`Payment failed with status: ${paymentIntent.status}`);
                }
            } else {
                onPaymentError('No payment information received. Please try again.');
            }
        } catch (err: any) {
            if (!mountedRef.current) return;
            console.error('Payment error:', err);
            onPaymentError(err?.message || 'An unexpected error occurred');
        } finally {
            if (mountedRef.current) {
                setIsProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement
                onReady={() => setIsElementReady(true)}
            />

            {children}

            <Button
                type="submit"
                disabled={!stripe || !isElementReady || isProcessing || !termsAccepted}
                className="w-full py-6 text-base"
                size="lg"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay £${amount.toFixed(2)}`
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                Your payment is secured by Stripe. We never store your card details.
            </p>
        </form>
    );
}

export function StripePaymentForm({
    clientSecret,
    amount,
    stripePublicKey,
    termsAccepted,
    onPaymentSuccess,
    onPaymentError,
    children,
}: StripePaymentFormProps) {
    // Memoize stripe promise so it's a stable reference across re-renders
    const stripePromise = useMemo(
        () => (stripePublicKey ? getStripePromise(stripePublicKey) : null),
        [stripePublicKey],
    );

    // Memoize options — only recreate when clientSecret changes
    // Appearance is set once at mount time (Stripe doesn't support changing it)
    const options: StripeElementsOptions = useMemo(
        () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return {
            clientSecret,
            appearance: {
                theme: isDarkMode ? 'night' as const : 'stripe' as const,
                variables: {
                    colorPrimary: isDarkMode ? '#3b82f6' : '#0570de',
                    colorBackground: isDarkMode ? '#1f2937' : '#ffffff',
                    colorText: isDarkMode ? '#f3f4f6' : '#1f2937',
                    colorDanger: isDarkMode ? '#ef4444' : '#df1b41',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '0.75rem',
                },
            },
        };
        },
        [clientSecret],
    );

    if (!stripePromise || !clientSecret) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Elements key={clientSecret} stripe={stripePromise} options={options}>
            <PaymentForm
                amount={amount}
                termsAccepted={termsAccepted}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
            >
                {children}
            </PaymentForm>
        </Elements>
    );
}
