import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { BookingProvider, useBooking } from '@/contexts/booking-context';
import { BookingSidebar } from '@/components/book/booking-sidebar';
import { BookingSummary } from '@/components/book/booking-summary';
import { StepCollection } from '@/components/book/step-collection';
import { StepLocation } from '@/components/book/step-location';
import { StepProvider } from '@/components/book/step-provider';
import { StepPatient } from '@/components/book/step-patient';
import { StepPayment } from '@/components/book/step-payment';
import { type UserAddress, type UserPaymentMethod, type PageProps } from '@/types';
import { router } from '@inertiajs/react';
import { CircleCheckBig } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookPageProps extends PageProps {
    userData?: { name: string; email: string; phone?: string };
    userAddresses?: UserAddress[];
    userPaymentMethods?: UserPaymentMethod[];
}

function BookingSteps({ pageProps }: { pageProps: BookPageProps }) {
    const { step, goToStep } = useBooking();

    const renderStep = () => {
        switch (step) {
            case 'collection':
                return <StepCollection />;

            case 'location':
                return (
                    <StepLocation
                        userAddresses={pageProps.userAddresses}
                        googleMapsKey={pageProps.googleMapsKey}
                    />
                );

            case 'provider':
                return <StepProvider googleMapsKey={pageProps.googleMapsKey} />;

            case 'patient':
                return (
                    <StepPatient
                        userData={pageProps.userData}
                        userAddresses={pageProps.userAddresses}
                    />
                );

            case 'payment':
                return (
                    <StepPayment
                        stripePublicKey={pageProps.stripePublicKey || ''}
                        userPaymentMethods={pageProps.userPaymentMethods}
                    />
                );

            case 'success':
                return <SuccessStep />;

            default:
                return <StepCollection />;
        }
    };

    return (
        <>
            <Head title={`Book Appointment - ${step.charAt(0).toUpperCase() + step.slice(1)}`} />

            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="lg:grid lg:grid-cols-[280px_1fr_320px] lg:gap-8">
                        {/* Left Sidebar - Progress */}
                        <div className="lg:block">
                            <BookingSidebar currentStep={step} onStepClick={goToStep} />
                        </div>

                        {/* Main Content */}
                        <main className="max-w-3xl lg:mx-0 mx-auto">
                            {renderStep()}
                        </main>

                        {/* Right Sidebar - Summary (hidden on success page) */}
                        {step !== 'success' && (
                            <aside className="hidden lg:block">
                                <div className="sticky top-8">
                                    <BookingSummary />
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function SuccessStep() {
    const { selectedProvider, selectedDate, timeOfDay, location } = useBooking();

    return (
        <div className="max-w-2xl mx-auto text-center py-12">
            <div className="mb-8">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                    <CircleCheckBig className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
                <p className="text-lg text-muted-foreground">
                    Your appointment has been successfully booked
                </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-foreground mb-4">Appointment Details</h2>

                {selectedProvider && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
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

                <div className="space-y-3">
                    {selectedDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date & Time</span>
                            <span className="text-foreground font-medium">
                                {selectedDate.toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })}{' '}
                                • {timeOfDay}
                            </span>
                        </div>
                    )}

                    {location && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="text-foreground font-medium">{location.postcode}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-accent/30 border border-border rounded-xl p-4 mb-8">
                <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to your email address. You can manage this appointment from your
                    dashboard.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => router.visit('/dashboard')} size="lg" className="px-8">
                    View Dashboard
                </Button>
                <Button
                    onClick={() => router.visit('/')}
                    variant="outline"
                    size="lg"
                    className="px-8"
                >
                    Back to Home
                </Button>
            </div>
        </div>
    );
}

export default function BookPage(props: BookPageProps) {
    return (
        <BookingProvider>
            <BookingSteps pageProps={props} />
        </BookingProvider>
    );
}

BookPage.layout = (page: React.ReactNode) => <PublicLayout hideFooter>{page}</PublicLayout>;
