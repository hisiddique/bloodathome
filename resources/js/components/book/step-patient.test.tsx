import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockBookingContext, createMockDependent, createMockUserData } from '@/test/mocks';

// Mock modules before imports that use them (hoisted by vitest)
vi.mock('@/contexts/booking-context', () => ({
    useBooking: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    router: { visit: vi.fn() },
}));

vi.mock('axios');

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

// Import after mocks are set up
import { useBooking } from '@/contexts/booking-context';
import { router } from '@inertiajs/react';
import { StepPatient } from './step-patient';

const mockSetStep = vi.fn();
const mockSetPatientDetails = vi.fn();
const mockGoBack = vi.fn();

function setupBookingMock(overrides: Record<string, any> = {}) {
    (useBooking as any).mockReturnValue(
        createMockBookingContext({
            patientDetails: null,
            isNhsTest: false,
            setPatientDetails: mockSetPatientDetails,
            setStep: mockSetStep,
            goBack: mockGoBack,
            ...overrides,
        })
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    setupBookingMock();
});

// -------------------------
// Auth Gate Tests
// -------------------------
describe('Auth Gate', () => {
    it('shows auth gate for unauthenticated users', () => {
        render(<StepPatient isAuthenticated={false} />);

        expect(screen.getByText('How would you like to continue?')).toBeInTheDocument();
    });

    it('hides auth gate for authenticated users', () => {
        const userData = createMockUserData();
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        expect(screen.queryByText('How would you like to continue?')).not.toBeInTheDocument();
    });

    it('"Continue as guest" switches to guest form', async () => {
        render(<StepPatient isAuthenticated={false} />);

        const guestButton = screen.getByText('Continue as guest');
        await userEvent.click(guestButton);

        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    });

    it('"Sign in" calls router.visit with correct redirect', async () => {
        render(<StepPatient isAuthenticated={false} />);

        const signInButton = screen.getByText('Sign in to your account');
        await userEvent.click(signInButton);

        expect((router as any).visit).toHaveBeenCalledWith('/login?redirect=/book');
    });
});

// -------------------------
// Patient Selection Tests
// -------------------------
describe('Patient Selection', () => {
    it('shows summary card with user name when user has stored details', () => {
        const userData = createMockUserData({ name: 'John Smith', first_name: 'John', last_name: 'Smith' });
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        // Summary card shows the full name
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('Your Details')).toBeInTheDocument();
    });

    it('shows edit button on summary card that opens the full selector', async () => {
        const userData = createMockUserData();
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        // Should show summary card initially
        expect(screen.getByText('Your Details')).toBeInTheDocument();

        // Click the Edit button
        const editButton = screen.getByLabelText('Edit patient details');
        await userEvent.click(editButton);

        // Should now show the full selector
        expect(screen.getByText('Who is this booking for?')).toBeInTheDocument();
    });

    it('selecting a dependent shows their information', async () => {
        const userData = createMockUserData();
        const dependent = createMockDependent({ full_name: 'Jane Smith' });
        render(
            <StepPatient
                isAuthenticated={true}
                userData={userData}
                userDependents={[dependent]}
            />
        );

        // Click Edit to enter edit mode first
        const editButton = screen.getByLabelText('Edit patient details');
        await userEvent.click(editButton);

        // Click the dependent button (appears in selector)
        const dependentButtons = screen.getAllByText('Jane Smith');
        await userEvent.click(dependentButtons[0]);

        // After clicking, name appears in both selector and patient info card
        const nameElements = screen.getAllByText('Jane Smith');
        expect(nameElements.length).toBeGreaterThanOrEqual(2);
    });

    it('"Add New" button shows the dependent creation form', async () => {
        const userData = createMockUserData();
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        // Click Edit to enter edit mode first
        const editButton = screen.getByLabelText('Edit patient details');
        await userEvent.click(editButton);

        const addNewButton = screen.getByText('Add New');
        await userEvent.click(addNewButton);

        expect(screen.getByText('Add New Dependent')).toBeInTheDocument();
    });

    it('shows full form immediately when user is missing date_of_birth', () => {
        const userData = createMockUserData({ date_of_birth: undefined });
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        // Should show full selector (no summary card)
        expect(screen.getByText('Who is this booking for?')).toBeInTheDocument();
        expect(screen.queryByText('Your Details')).not.toBeInTheDocument();
    });
});

// -------------------------
// NHS Number Tests
// -------------------------
describe('NHS Number', () => {
    it('NHS field does not appear when isNhsTest is false', () => {
        const userData = createMockUserData();
        setupBookingMock({ isNhsTest: false });

        render(<StepPatient isAuthenticated={true} userData={userData} />);

        expect(screen.queryByLabelText(/NHS Number/i)).not.toBeInTheDocument();
    });

    it('NHS field appears when isNhsTest is true', () => {
        const userData = createMockUserData();
        setupBookingMock({ isNhsTest: true });

        render(<StepPatient isAuthenticated={true} userData={userData} />);

        expect(screen.getByLabelText(/NHS Number/i)).toBeInTheDocument();
    });

    it('shows saved NHS number in the summary card when user has nhs_number', () => {
        const userData = createMockUserData({ nhs_number: '1234567890' });
        setupBookingMock({ isNhsTest: false });

        render(<StepPatient isAuthenticated={true} userData={userData} />);

        // NHS number appears in the summary card details grid
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('NHS Number')).toBeInTheDocument();
    });

    it('NHS save error blocks Continue and shows toast', async () => {
        const userData = createMockUserData(); // No nhs_number
        setupBookingMock({ isNhsTest: true });

        (axios.patch as any).mockRejectedValue({
            response: { data: { message: 'Invalid NHS number' } },
        });

        render(<StepPatient isAuthenticated={true} userData={userData} />);

        // Type a 10-digit NHS number
        const nhsInput = screen.getByLabelText(/NHS Number/i);
        await userEvent.type(nhsInput, '1234567890');

        // Blur the field to trigger handleNhsBlur
        fireEvent.blur(nhsInput);

        // Wait for the error state to be set
        await waitFor(() => {
            expect(screen.getByText(/NHS number could not be saved/i)).toBeInTheDocument();
        });

        // Click "Continue to Payment"
        const continueButton = screen.getByText('Continue to Payment');
        await userEvent.click(continueButton);

        expect(mockSetStep).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
            'Please fix the NHS number error before continuing'
        );
    });

    it('typing in NHS field clears previous save error', async () => {
        const userData = createMockUserData();
        setupBookingMock({ isNhsTest: true });

        (axios.patch as any).mockRejectedValue({
            response: { data: { message: 'Invalid NHS number' } },
        });

        render(<StepPatient isAuthenticated={true} userData={userData} />);

        const nhsInput = screen.getByLabelText(/NHS Number/i);
        await userEvent.type(nhsInput, '1234567890');
        fireEvent.blur(nhsInput);

        await waitFor(() => {
            expect(screen.getByText(/NHS number could not be saved/i)).toBeInTheDocument();
        });

        // Clear and type a new value to trigger onChange which clears the error
        await userEvent.clear(nhsInput);
        await userEvent.type(nhsInput, '9876543210');

        await waitFor(() => {
            expect(screen.queryByText(/NHS number could not be saved/i)).not.toBeInTheDocument();
        });
    });

    it('auto-saves on blur with a valid 10-digit NHS number', async () => {
        const userData = createMockUserData();
        setupBookingMock({ isNhsTest: true });

        (axios.patch as any).mockResolvedValue({ data: { success: true } });

        render(<StepPatient isAuthenticated={true} userData={userData} />);

        const nhsInput = screen.getByLabelText(/NHS Number/i);
        await userEvent.type(nhsInput, '1234567890');
        fireEvent.blur(nhsInput);

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith('/api/nhs-number', {
                nhs_number: '1234567890',
            });
        });
    });
});

// -------------------------
// Under 16 / Guardian Tests
// -------------------------
describe('Under 16 / Guardian', () => {
    it('shows guardian fields when patient is under 16', () => {
        // A date 2 years ago = patient is ~2 years old (under 16)
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const dob = twoYearsAgo.toISOString().split('T')[0];

        const userData = createMockUserData({ date_of_birth: dob });
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        expect(screen.getByText('Guardian Information Required')).toBeInTheDocument();
    });

    it('blocks Continue when patient is under 16 and no guardian name provided', async () => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const dob = twoYearsAgo.toISOString().split('T')[0];

        const userData = createMockUserData({ date_of_birth: dob });
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        const continueButton = screen.getByText('Continue to Payment');
        await userEvent.click(continueButton);

        expect(toast.error).toHaveBeenCalledWith('Please enter guardian name');
        expect(mockSetStep).not.toHaveBeenCalled();
    });

    it('blocks Continue when patient is under 16 and guardian confirmation not checked', async () => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const dob = twoYearsAgo.toISOString().split('T')[0];

        const userData = createMockUserData({ date_of_birth: dob });
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        // Fill guardian name but don't check confirmation
        const guardianNameInput = screen.getByLabelText(/Guardian Name/i);
        await userEvent.type(guardianNameInput, 'Jane Parent');

        const continueButton = screen.getByText('Continue to Payment');
        await userEvent.click(continueButton);

        expect(toast.error).toHaveBeenCalledWith('Please confirm parental responsibility');
        expect(mockSetStep).not.toHaveBeenCalled();
    });
});

// -------------------------
// handleContinue Data Shape Tests
// -------------------------
describe('handleContinue data shape', () => {
    it('builds correct data for "myself" with isGuest:false and dependentId:null', async () => {
        const userData = createMockUserData({ name: 'John Smith', email: 'john@test.com' });
        render(<StepPatient isAuthenticated={true} userData={userData} />);

        const continueButton = screen.getByText('Continue to Payment');
        await userEvent.click(continueButton);

        expect(mockSetPatientDetails).toHaveBeenCalledWith(
            expect.objectContaining({
                isGuest: false,
                dependentId: null,
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@test.com',
            })
        );
    });

    it('builds correct data for a dependent with dependentId set', async () => {
        const userData = createMockUserData({ email: 'john@test.com', phone: '07123456789' });
        const dependent = createMockDependent({
            id: 'dep-abc',
            first_name: 'Jane',
            last_name: 'Smith',
        });
        render(
            <StepPatient
                isAuthenticated={true}
                userData={userData}
                userDependents={[dependent]}
            />
        );

        // Click Edit to enter edit mode first (summary card shown by default)
        const editButton = screen.getByLabelText('Edit patient details');
        await userEvent.click(editButton);

        // Select the dependent
        const dependentButton = screen.getByText('Jane Smith');
        await userEvent.click(dependentButton);

        const continueButton = screen.getByText('Continue to Payment');
        await userEvent.click(continueButton);

        expect(mockSetPatientDetails).toHaveBeenCalledWith(
            expect.objectContaining({
                dependentId: 'dep-abc',
                firstName: 'Jane',
                lastName: 'Smith',
                isGuest: false,
            })
        );
    });
});

// -------------------------
// Guest Form Validation
// -------------------------
describe('Guest Form validation', () => {
    it('disables Continue button when required fields are empty in guest form', async () => {
        render(<StepPatient isAuthenticated={false} />);

        // Switch to guest form
        const guestButton = screen.getByText('Continue as guest');
        await userEvent.click(guestButton);

        // Continue button should be disabled when form is invalid
        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).toBeDisabled();
    });
});

// -------------------------
// Guest Form — Comprehensive Validation
// -------------------------
describe('Guest Form — comprehensive validation', () => {
    async function switchToGuestForm() {
        render(<StepPatient isAuthenticated={false} />);
        const guestButton = screen.getByText('Continue as guest');
        await userEvent.click(guestButton);
    }

    async function fillValidGuestForm() {
        await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '07123456789');
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: '1990-06-15' },
        });
    }

    it('pre-fills guest form from previous patientDetails (restore state)', async () => {
        setupBookingMock({
            patientDetails: {
                firstName: 'Jane',
                lastName: 'Returning',
                email: 'jane.returning@test.com',
                phone: '07999888777',
                dateOfBirth: '1992-04-10',
                isUnder16: false,
                isGuest: true,
                dependentId: null,
            },
        });

        render(<StepPatient isAuthenticated={false} />);
        const guestButton = screen.getByText('Continue as guest');
        await userEvent.click(guestButton);

        expect(screen.getByLabelText(/First Name/i)).toHaveValue('Jane');
        expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Returning');
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue('jane.returning@test.com');
        expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('07999888777');
    });

    it('enables Continue button when all required fields are valid', async () => {
        await switchToGuestForm();
        await fillValidGuestForm();

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).not.toBeDisabled();
    });

    it('keeps Continue button disabled with invalid email format', async () => {
        await switchToGuestForm();

        await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'not-an-email');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '07123456789');
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: '1990-06-15' },
        });

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).toBeDisabled();
    });

    it('keeps Continue button disabled with invalid phone format', async () => {
        await switchToGuestForm();

        await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '123');
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: '1990-06-15' },
        });

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).toBeDisabled();
    });

    it('keeps Continue button disabled when date of birth is missing', async () => {
        await switchToGuestForm();

        await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '07123456789');
        // DOB left empty

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).toBeDisabled();
    });

    it('shows NHS number field for guest when isNhsTest is true', async () => {
        setupBookingMock({ isNhsTest: true });

        render(<StepPatient isAuthenticated={false} />);
        const guestButton = screen.getByText('Continue as guest');
        await userEvent.click(guestButton);

        expect(screen.getByLabelText(/NHS Number/i)).toBeInTheDocument();
    });

    it('keeps Continue button disabled for guest when isNhsTest is true and NHS number is invalid', async () => {
        setupBookingMock({ isNhsTest: true });

        render(<StepPatient isAuthenticated={false} />);
        const guestButton = screen.getByText('Continue as guest');
        await userEvent.click(guestButton);

        await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '07123456789');
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: '1990-06-15' },
        });
        // NHS number left empty or invalid

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).toBeDisabled();
    });

    it('enables Continue for guest when isNhsTest is true and valid 10-digit NHS number entered', async () => {
        setupBookingMock({ isNhsTest: true });

        render(<StepPatient isAuthenticated={false} />);
        const guestButton = screen.getByText('Continue as guest');
        await userEvent.click(guestButton);

        await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '07123456789');
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: '1990-06-15' },
        });
        await userEvent.type(screen.getByLabelText(/NHS Number/i), '1234567890');

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).not.toBeDisabled();
    });

    it('shows guardian fields for guest when patient is under 16', async () => {
        await switchToGuestForm();

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const dob = twoYearsAgo.toISOString().split('T')[0];

        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: dob },
        });

        expect(screen.getByText('Guardian Information Required')).toBeInTheDocument();
    });

    it('keeps Continue disabled for guest under 16 without guardian name', async () => {
        await switchToGuestForm();

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const dob = twoYearsAgo.toISOString().split('T')[0];

        await userEvent.type(screen.getByLabelText(/First Name/i), 'Child');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'child@example.com');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '07123456789');
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: dob },
        });

        // Guardian confirmation checked but no name provided
        const guardianCheckbox = screen.getByLabelText(/I confirm that I have parental/i);
        await userEvent.click(guardianCheckbox);

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).toBeDisabled();
    });

    it('keeps Continue disabled for guest under 16 without guardian confirmation', async () => {
        await switchToGuestForm();

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const dob = twoYearsAgo.toISOString().split('T')[0];

        await userEvent.type(screen.getByLabelText(/First Name/i), 'Child');
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Guest');
        await userEvent.type(screen.getByLabelText(/Email Address/i), 'child@example.com');
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '07123456789');
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
            target: { value: dob },
        });

        // Guardian name provided but confirmation not checked
        const guardianNameInput = screen.getByLabelText(
            /Guardian Name \(Adult with Parental Responsibility\)/i
        );
        await userEvent.type(guardianNameInput, 'Jane Parent');

        const continueButton = screen.getByText('Continue to Payment');
        expect(continueButton).toBeDisabled();
    });

    it('builds correct guest data shape when Continue is clicked', async () => {
        await switchToGuestForm();
        await fillValidGuestForm();

        const continueButton = screen.getByText('Continue to Payment');
        await userEvent.click(continueButton);

        expect(mockSetPatientDetails).toHaveBeenCalledWith(
            expect.objectContaining({
                isGuest: true,
                firstName: 'Jane',
                lastName: 'Guest',
                email: 'jane@example.com',
                phone: '07123456789',
            })
        );

        // Guest form does not set a dependentId (booking is for the guest themselves)
        const calledWith = mockSetPatientDetails.mock.calls[0][0];
        expect(calledWith).not.toHaveProperty('dependentId');
    });

    it('sets step to payment when guest form is valid and Continue is clicked', async () => {
        await switchToGuestForm();
        await fillValidGuestForm();

        const continueButton = screen.getByText('Continue to Payment');
        await userEvent.click(continueButton);

        expect(mockSetStep).toHaveBeenCalledWith('payment');
    });
});
