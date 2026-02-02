import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
    clientSecret: string;
    amount: number;
    stripePublicKey: string;
    onPaymentSuccess: (paymentIntentId: string) => void;
    onPaymentError: (error: string) => void;
}

function PaymentForm({
    amount,
    onPaymentSuccess,
    onPaymentError,
}: {
    amount: number;
    onPaymentSuccess: (paymentIntentId: string) => void;
    onPaymentError: (error: string) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

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

            if (error) {
                onPaymentError(error.message || 'Payment failed');
                toast.error(error.message || 'Payment failed');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onPaymentSuccess(paymentIntent.id);
                toast.success('Payment successful');
            }
        } catch (err) {
            console.error('Payment error:', err);
            onPaymentError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
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
    onPaymentSuccess,
    onPaymentError,
}: StripePaymentFormProps) {
    const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

    useEffect(() => {
        if (stripePublicKey) {
            setStripePromise(loadStripe(stripePublicKey));
        }
    }, [stripePublicKey]);

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
            theme: 'stripe',
            variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'hsl(var(--background))',
                colorText: 'hsl(var(--foreground))',
                colorDanger: 'hsl(var(--destructive))',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '0.75rem',
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentForm amount={amount} onPaymentSuccess={onPaymentSuccess} onPaymentError={onPaymentError} />
        </Elements>
    );
}
