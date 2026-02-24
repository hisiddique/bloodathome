import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockBookingContext } from '@/test/mocks';

// Mock all external dependencies before component imports
vi.mock('@/contexts/booking-context', () => ({
    useBooking: vi.fn(),
}));

vi.mock('@/hooks/use-booking-api', () => ({
    useBookingApi: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('./stripe-payment-form', () => ({
    StripePaymentForm: ({ children, onPaymentSuccess }: any) => (
        <div data-testid="stripe-form">
            {children}
            <button data-testid="mock-pay" onClick={() => onPaymentSuccess('pi_test_123')}>
                Pay
            </button>
        </div>
    ),
}));

vi.mock('./step-back-link', () => ({
    StepBackLink: ({ label, onClick }: any) => <button onClick={onClick}>{label}</button>,
}));

// Import after mocks
import { useBooking } from '@/contexts/booking-context';
import { useBookingApi } from '@/hooks/use-booking-api';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { StepPayment } from './step-payment';

const mockSetStep = vi.fn();
const mockSetDraftId = vi.fn();
const mockSetPaymentIntentClientSecret = vi.fn();
const mockSetTotalAmount = vi.fn();
const mockSetPromoCode = vi.fn();
const mockSetDiscount = vi.fn();
const mockSetConfirmationNumber = vi.fn();
const mockGoBack = vi.fn();

const mockCreateDraft = vi.fn().mockResolvedValue({ id: 'draft-123' });
const mockCreatePaymentIntent = vi
    .fn()
    .mockResolvedValue({ clientSecret: 'pi_secret_test', amount: 5000 });
const mockApplyPromoCode = vi.fn();
const mockConfirmBooking = vi
    .fn()
    .mockResolvedValue({ confirmationNumber: 'BK-123456', bookingId: 'booking-1' });

function setupDefaultMocks(bookingOverrides: Record<string, any> = {}) {
    const baseContext = createMockBookingContext({
        selectedServices: [
            {
                id: 'svc-1',
                service_name: 'Full Blood Count',
                service_code: 'FBC',
                category: { id: 1, name: 'Haematology' },
                is_active: true,
            },
        ],
        bookedServices: [],
        collectionType: 'home_visit',
        location: {
            postcode: 'SW1A 1AA',
            lat: 51.501,
            lng: -0.1415,
            address: '10 Downing Street',
            addressLine1: '10 Downing Street',
            townCity: 'London',
        },
        selectedDate: new Date('2026-03-15'),
        selectedSlot: { time: '09:00', available: true },
        selectedProvider: {
            id: 'provider-1',
            user: { first_name: 'Dr', last_name: 'Jones', full_name: 'Dr Jones' },
            type: { id: 1, name: 'Phlebotomist' },
            latitude: 51.5,
            longitude: -0.1,
            average_rating: 4.8,
            total_reviews: 50,
            show_image_in_search: false,
        },
        patientDetails: {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@test.com',
            phone: '07123456789',
            dateOfBirth: '1990-05-15',
            isUnder16: false,
            isGuest: false,
            dependentId: null,
        },
        draftId: null,
        paymentIntentClientSecret: null,
        totalAmount: 75,
        promoCode: undefined,
        discount: undefined,
        confirmationNumber: null,
        setStep: mockSetStep,
        setDraftId: mockSetDraftId,
        setPaymentIntentClientSecret: mockSetPaymentIntentClientSecret,
        setTotalAmount: mockSetTotalAmount,
        setPromoCode: mockSetPromoCode,
        setDiscount: mockSetDiscount,
        setConfirmationNumber: mockSetConfirmationNumber,
        goBack: mockGoBack,
        ...bookingOverrides,
    });

    (useBooking as any).mockReturnValue(baseContext);

    (useBookingApi as any).mockReturnValue({
        createDraft: mockCreateDraft,
        createPaymentIntent: mockCreatePaymentIntent,
        applyPromoCode: mockApplyPromoCode,
        confirmBooking: mockConfirmBooking,
    });

    (usePage as any).mockReturnValue({
        props: { auth: { user: { id: 'user-1', email: 'john@test.com' } } },
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
});

describe('StepPayment', () => {
    describe('Loading state', () => {
        it('calls createDraft when no draftId exists and all required state is present', async () => {
            render(<StepPayment stripePublicKey="pk_test_123" />);

            await waitFor(() => {
                expect(mockCreateDraft).toHaveBeenCalled();
            });
        });
    });

    describe('Promo code', () => {
        it('shows promo code input when no discount is applied', () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
                discount: undefined,
            });

            render(<StepPayment stripePublicKey="pk_test_123" />);

            expect(screen.getByPlaceholderText('Enter code')).toBeInTheDocument();
        });

        it('hides promo code input when a discount is already applied', () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
                discount: 10,
                promoCode: 'SAVE10',
            });

            render(<StepPayment stripePublicKey="pk_test_123" />);

            expect(screen.queryByPlaceholderText('Enter code')).not.toBeInTheDocument();
        });
    });

    describe('Saved payment methods', () => {
        const savedMethods = [
            {
                id: 'pm-1',
                card_brand: 'visa',
                card_last_four: '4242',
                card_exp_month: 12,
                card_exp_year: 2026,
                is_default: true,
            },
            {
                id: 'pm-2',
                card_brand: 'mastercard',
                card_last_four: '5555',
                card_exp_month: 6,
                card_exp_year: 2027,
                is_default: false,
            },
        ];

        it('shows saved payment methods with card details', () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={savedMethods} />);

            expect(screen.getByText(/visa •••• 4242/i)).toBeInTheDocument();
            expect(screen.getByText(/mastercard •••• 5555/i)).toBeInTheDocument();
        });

        it('pre-selects the default payment method', () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={savedMethods} />);

            // The default card (pm-1) should have a check icon and be selected
            // The "Saved Payment Methods" label shows when a method is selected
            expect(screen.getByText('Saved Payment Methods')).toBeInTheDocument();
        });

        it('shows "coming soon" message for saved card payment', () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={savedMethods} />);

            expect(
                screen.getByText(/Saved card payments coming soon/i)
            ).toBeInTheDocument();
        });

        it('shows "Use a different card" button when saved methods exist', () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={savedMethods} />);

            expect(screen.getByText('Use a different card')).toBeInTheDocument();
        });
    });

    describe('New card flow', () => {
        it('shows Stripe payment form when no saved methods exist and clientSecret is available', () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={[]} />);

            expect(screen.getByTestId('stripe-form')).toBeInTheDocument();
        });
    });

    describe('Guest payment flow', () => {
        function setupGuestMocks(bookingOverrides: Record<string, any> = {}) {
            setupDefaultMocks({
                patientDetails: {
                    firstName: 'Jane',
                    lastName: 'Guest',
                    email: 'jane.guest@test.com',
                    phone: '07987654321',
                    dateOfBirth: '1985-08-20',
                    isUnder16: false,
                    isGuest: true,
                    dependentId: null,
                },
                ...bookingOverrides,
            });

            (usePage as any).mockReturnValue({
                props: { auth: { user: null } },
            });
        }

        it('calls createDraft for guest users when patientDetails.isGuest is true', async () => {
            setupGuestMocks({ draftId: null });

            render(<StepPayment stripePublicKey="pk_test_123" />);

            await waitFor(() => {
                expect(mockCreateDraft).toHaveBeenCalled();
            });
        });

        it('includes guest_name, guest_email, and guest_phone in draft payload for guests', async () => {
            setupGuestMocks({ draftId: null });

            render(<StepPayment stripePublicKey="pk_test_123" />);

            await waitFor(() => {
                expect(mockCreateDraft).toHaveBeenCalledWith(
                    expect.objectContaining({
                        is_guest_booking: true,
                        guest_name: 'Jane Guest',
                        guest_email: 'jane.guest@test.com',
                        guest_phone: '07987654321',
                    })
                );
            });
        });

        it('shows Stripe form for guest users (no saved payment methods)', () => {
            setupGuestMocks({
                draftId: 'draft-guest-1',
                paymentIntentClientSecret: 'pi_secret_guest',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={[]} />);

            expect(screen.getByTestId('stripe-form')).toBeInTheDocument();
        });

        it('does NOT show saved payment methods section for guests', () => {
            setupGuestMocks({
                draftId: 'draft-guest-1',
                paymentIntentClientSecret: 'pi_secret_guest',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={[]} />);

            expect(screen.queryByText('Saved Payment Methods')).not.toBeInTheDocument();
        });

        it('shows promo code input for guests', () => {
            setupGuestMocks({
                draftId: 'draft-guest-1',
                paymentIntentClientSecret: 'pi_secret_guest',
                discount: undefined,
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={[]} />);

            expect(screen.getByPlaceholderText('Enter code')).toBeInTheDocument();
        });

        it('confirms booking successfully for guest users', async () => {
            setupGuestMocks({
                draftId: 'draft-guest-1',
                paymentIntentClientSecret: 'pi_secret_guest',
            });

            mockConfirmBooking.mockResolvedValue({
                confirmationNumber: 'BK-GUEST-001',
                bookingId: 'booking-guest-1',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={[]} />);

            const payButton = screen.getByTestId('mock-pay');
            fireEvent.click(payButton);

            await waitFor(() => {
                expect(mockSetConfirmationNumber).toHaveBeenCalledWith('BK-GUEST-001');
                expect(mockSetStep).toHaveBeenCalledWith('success');
            });
        });
    });

    describe('Payment confirmation', () => {
        it('retries on confirm failure up to 3 times then shows error', async () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
            });

            mockConfirmBooking.mockRejectedValue(new Error('Server error'));

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={[]} />);

            const payButton = screen.getByTestId('mock-pay');
            fireEvent.click(payButton);

            await waitFor(
                () => {
                    expect(mockConfirmBooking).toHaveBeenCalledTimes(3);
                },
                { timeout: 10000 }
            );

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    expect.stringContaining('Payment succeeded but booking confirmation failed'),
                    expect.any(Object)
                );
            });
        }, 15000);

        it('sets confirmationNumber and navigates to success on successful payment', async () => {
            setupDefaultMocks({
                draftId: 'draft-123',
                paymentIntentClientSecret: 'pi_secret_123',
            });

            mockConfirmBooking.mockResolvedValue({
                confirmationNumber: 'BK-999',
                bookingId: 'booking-1',
            });

            render(<StepPayment stripePublicKey="pk_test_123" userPaymentMethods={[]} />);

            const payButton = screen.getByTestId('mock-pay');
            fireEvent.click(payButton);

            await waitFor(() => {
                expect(mockSetConfirmationNumber).toHaveBeenCalledWith('BK-999');
                expect(mockSetStep).toHaveBeenCalledWith('success');
            });
        });
    });
});
