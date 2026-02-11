import { useState, useEffect } from 'react';
import { loadStripe, type Stripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Loader2, ShieldCheck } from 'lucide-react';

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

interface CreatePaymentMethodProps {
    clientSecret: string;
    stripePublicKey: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Methods',
        href: '/payment-methods',
    },
    {
        title: 'Add Payment Method',
        href: '/payment-methods/create',
    },
];

function SetupForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        // confirmSetup always redirects to return_url on success.
        // The backend handles retrieving the SetupIntent and saving the PM.
        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-methods/setup-complete`,
            },
        });

        // Only reaches here if there's a validation error (no redirect happened)
        if (error) {
            setErrorMessage(error.message || 'Failed to save card. Please try again.');
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <div className="flex gap-3">
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="flex-1"
                    size="lg"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 size-4" />
                            Save Card
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    asChild
                    disabled={isProcessing}
                >
                    <Link href="/payment-methods">Cancel</Link>
                </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Your payment details are secured by Stripe.
            </p>
        </form>
    );
}

export default function CreatePaymentMethod({
    clientSecret,
    stripePublicKey,
}: CreatePaymentMethodProps) {
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
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Add Payment Method" />
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-primary" />
                </div>
            </AppLayout>
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Payment Method" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Add Payment Method"
                        description="Add a credit or debit card to your account"
                    />

                    <Elements
                        key={isDarkMode ? 'dark' : 'light'}
                        stripe={stripePromise}
                        options={options}
                    >
                        <SetupForm />
                    </Elements>
                </div>
            </div>
        </AppLayout>
    );
}
