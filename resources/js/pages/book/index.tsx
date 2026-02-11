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
import { StepSuccess } from '@/components/book/step-success';
import { type UserAddress, type UserPaymentMethod, type PageProps } from '@/types';

interface Dependent {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    relationship: string;
    nhs_number?: string;
}

interface BookPageProps extends PageProps {
    userData?: { name: string; email: string; phone?: string };
    userAddresses?: UserAddress[];
    userPaymentMethods?: UserPaymentMethod[];
    userDependents?: Dependent[];
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
                        isAuthenticated={!!pageProps.auth?.user}
                    />
                );

            case 'provider':
                return <StepProvider googleMapsKey={pageProps.googleMapsKey} />;

            case 'patient':
                return (
                    <StepPatient
                        userData={pageProps.userData}
                        isAuthenticated={!!pageProps.auth?.user}
                        userDependents={pageProps.userDependents}
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
                return <StepSuccess />;

            default:
                return <StepCollection />;
        }
    };

    if (step === 'success') {
        return (
            <>
                <Head title="Booking Confirmed" />
                <div className="min-h-screen bg-background">
                    <div className="container mx-auto px-4 py-8">
                        <main className="max-w-3xl mx-auto">
                            {renderStep()}
                        </main>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Book Appointment - ${step.charAt(0).toUpperCase() + step.slice(1)}`} />

            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="lg:grid lg:grid-cols-[280px_1fr_320px] lg:gap-8 lg:items-start">
                        {/* Left Sidebar - Progress (sticky) */}
                        <div className="hidden lg:block sticky top-20">
                            <BookingSidebar currentStep={step} onStepClick={goToStep} />
                        </div>

                        {/* Main Content (scrolls) */}
                        <main className="max-w-3xl lg:mx-0 mx-auto">
                            {/* Mobile Progress Bar */}
                            <div className="lg:hidden">
                                <BookingSidebar currentStep={step} onStepClick={goToStep} />
                            </div>
                            {renderStep()}
                        </main>

                        {/* Right Sidebar - Summary (sticky) */}
                        <div className="hidden lg:block sticky top-20">
                            <BookingSummary />
                        </div>
                    </div>
                </div>
            </div>
        </>
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
