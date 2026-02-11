import { useState, useEffect, useRef } from 'react';
import { loadStripe, type Stripe, StripeElementsOptions } from '@stripe/stripe-js';
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
    onPaymentSuccess: (paymentIntentId: string) => void;
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
    onPaymentSuccess: (paymentIntentId: string) => void;
    onPaymentError: (error: string) => void;
    children?: React.ReactNode;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
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

        setIsProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/book/success`,
                },
                redirect: 'if_required',
            });

            if (!mountedRef.current) return;

            if (error) {
                onPaymentError(error.message || 'Payment failed');
                toast.error(error.message || 'Payment failed');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onPaymentSuccess(paymentIntent.id);
            }
        } catch (err) {
            if (!mountedRef.current) return;
            console.error('Payment error:', err);
            onPaymentError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            if (mountedRef.current) {
                setIsProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />

            {children}

            <Button
                type="submit"
                disabled={!stripe || isProcessing || !termsAccepted}
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
    const stripePromise = stripePublicKey ? getStripePromise(stripePublicKey) : null;
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        // Watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    if (!stripePromise || !clientSecret) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
            theme: isDarkMode ? 'night' : 'stripe',
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

    return (
        <Elements key={isDarkMode ? 'dark' : 'light'} stripe={stripePromise} options={options}>
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
