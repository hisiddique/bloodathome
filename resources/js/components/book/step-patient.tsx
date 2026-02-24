import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, LogIn, UserPlus, Mail, User, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBooking, type PatientDetailsData } from '@/contexts/booking-context';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';

interface Dependent {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    relationship: string;
    nhs_number?: string;
}

interface StepPatientProps {
    userData?: {
        name: string;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        date_of_birth?: string;
        nhs_number?: string;
    };
    isAuthenticated: boolean;
    userDependents?: Dependent[];
}

export function StepPatient({ userData, isAuthenticated, userDependents = [] }: StepPatientProps) {
    const {
        patientDetails,
        isNhsTest,
        setPatientDetails,
        setStep,
        goBack,
    } = useBooking();

    const [showAuthGate, setShowAuthGate] = useState(!isAuthenticated);
    const [continueAsGuest, setContinueAsGuest] = useState(false);

    // Determine if the user has all required details stored on their profile
    const hasStoredDetails = isAuthenticated &&
        !!userData?.first_name &&
        !!userData?.last_name &&
        !!userData?.email &&
        !!userData?.date_of_birth;

    // "myself" | dependent.id | "add-new"
    const [selectedOption, setSelectedOption] = useState<string>('myself');

    // Local dependent list (can grow when adding new)
    const [dependents, setDependents] = useState<Dependent[]>(userDependents);

    // Form state for adding a new dependent
    const [newDependent, setNewDependent] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        relationship: 'child' as 'child' | 'spouse' | 'parent' | 'other',
        nhs_number: '',
    });
    const [isAddingDependent, setIsAddingDependent] = useState(false);

    // Booking-specific fields — prefer context value if user already entered one
    const initialNhsNumber = patientDetails?.nhsNumber || userData?.nhs_number || '';
    const [nhsNumber, setNhsNumber] = useState(initialNhsNumber);
    const [guardianName, setGuardianName] = useState('');
    const [guardianConfirmed, setGuardianConfirmed] = useState(false);
    const [notes, setNotes] = useState('');

    // Pre-fill NHS number from profile/dependent only when selection changes (not on re-mount)
    const prevSelectedOption = useRef(selectedOption);
    useEffect(() => {
        if (selectedOption !== prevSelectedOption.current) {
            prevSelectedOption.current = selectedOption;
            if (selectedOption === 'myself') {
                setNhsNumber(userData?.nhs_number || '');
            } else if (selectedOption === 'add-new') {
                setNhsNumber('');
            } else {
                const dep = dependents.find((d) => d.id === selectedOption);
                setNhsNumber(dep?.nhs_number || '');
            }
        }
    }, [selectedOption, userData, dependents]);

    // Calculate if patient is under 16 based on date of birth
    const calculateIsUnder16 = (dob: string): boolean => {
        if (!dob) return false;

        const birthDate = new Date(dob);
        const today = new Date();

        // Calculate age in years
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Adjust age if birthday hasn't occurred this year yet
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age < 16;
    };

    // Determine the currently selected person's DOB
    const selectedDob = useMemo(() => {
        if (selectedOption === 'myself') {
            return userData?.date_of_birth || '';
        }
        if (selectedOption === 'add-new') {
            return '';
        }
        const dep = dependents.find((d) => d.id === selectedOption);
        return dep?.date_of_birth || '';
    }, [selectedOption, userData, dependents]);

    const isUnder16 = useMemo(() => calculateIsUnder16(selectedDob), [selectedDob]);

    const handleContinueAsGuest = () => {
        setContinueAsGuest(true);
        setShowAuthGate(false);
    };

    const handleAddNewDependent = async () => {
        // Validate
        if (!newDependent.first_name.trim()) {
            toast.error('Please enter first name');
            return;
        }
        if (!newDependent.last_name.trim()) {
            toast.error('Please enter last name');
            return;
        }
        if (!newDependent.date_of_birth) {
            toast.error('Please enter date of birth');
            return;
        }
        if (!newDependent.relationship) {
            toast.error('Please select relationship');
            return;
        }

        setIsAddingDependent(true);

        try {
            const response = await axios.post('/api/dependents', newDependent);

            if (response.data.success && response.data.dependent) {
                const added = response.data.dependent;
                setDependents((prev) => [...prev, added]);
                // Auto-select the new dependent
                setSelectedOption(added.id);
                toast.success('Dependent added successfully');
                // Reset form
                setNewDependent({
                    first_name: '',
                    last_name: '',
                    date_of_birth: '',
                    relationship: 'child',
                    nhs_number: '',
                });
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message ||
                'Failed to add dependent. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsAddingDependent(false);
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const cleaned = phone.replace(/[\s\-()]/g, '');
        return /^(\+?\d{10,15})$/.test(cleaned);
    };

    const validateNhsNumber = (nhsNumber: string): boolean => {
        const nhsRegex = /^\d{10}$/;
        return nhsRegex.test(nhsNumber.replace(/\s/g, ''));
    };

    // Continue from the compact summary card without entering edit mode
    const handleContinueFromSummary = () => {
        if (!userData) {
            toast.error('User data not available');
            return;
        }

        const isUnder16ForSummary = calculateIsUnder16(userData.date_of_birth || '');

        const details: PatientDetailsData = {
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            dateOfBirth: userData.date_of_birth || '',
            nhsNumber: nhsNumber || userData.nhs_number || '',
            isUnder16: isUnder16ForSummary,
            guardianName: isUnder16ForSummary ? guardianName : '',
            guardianConfirmed: isUnder16ForSummary ? guardianConfirmed : false,
            notes,
            isGuest: false,
            dependentId: null,
        };

        if (isNhsTest && !validateNhsNumber(details.nhsNumber || '')) {
            toast.error('Please enter a valid 10-digit NHS number');
            return;
        }

        if (details.isUnder16) {
            if (!details.guardianName?.trim()) {
                toast.error('Please enter guardian name');
                return;
            }
            if (!details.guardianConfirmed) {
                toast.error('Please confirm parental responsibility');
                return;
            }
        }

        setPatientDetails(details);
        setStep('payment');
    };

    const handleContinue = () => {
        let details: PatientDetailsData;

        if (selectedOption === 'myself') {
            // Build from userData
            if (!userData) {
                toast.error('User data not available');
                return;
            }
            details = {
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                dateOfBirth: userData.date_of_birth || '',
                nhsNumber: nhsNumber,
                isUnder16,
                guardianName: isUnder16 ? guardianName : '',
                guardianConfirmed: isUnder16 ? guardianConfirmed : false,
                notes,
                isGuest: false,
                dependentId: null,
            };
        } else if (selectedOption === 'add-new') {
            toast.error('Please save the new dependent first');
            return;
        } else {
            // A dependent is selected
            const dep = dependents.find((d) => d.id === selectedOption);
            if (!dep) {
                toast.error('Dependent not found');
                return;
            }
            details = {
                firstName: dep.first_name,
                lastName: dep.last_name,
                email: userData?.email || '',
                phone: userData?.phone || '',
                dateOfBirth: dep.date_of_birth,
                nhsNumber: nhsNumber || dep.nhs_number || '',
                isUnder16,
                guardianName: isUnder16 ? guardianName : '',
                guardianConfirmed: isUnder16 ? guardianConfirmed : false,
                notes,
                isGuest: false,
                dependentId: dep.id,
            };
        }

        // NHS number format validation
        if (isNhsTest && !validateNhsNumber(details.nhsNumber || '')) {
            toast.error('Please enter a valid 10-digit NHS number');
            return;
        }

        // Under 16 validation
        if (details.isUnder16) {
            if (!details.guardianName?.trim()) {
                toast.error('Please enter guardian name');
                return;
            }
            if (!details.guardianConfirmed) {
                toast.error('Please confirm parental responsibility');
                return;
            }
        }

        setPatientDetails(details);
        setStep('payment');
    };

    // Format DOB nicely for display
    const formatDob = (dob: string): string => {
        if (!dob) return '';
        const date = new Date(dob);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Guest Flow - Full editable form (unchanged from original logic)
    if (!isAuthenticated && continueAsGuest) {
        return <GuestForm goBack={goBack} />;
    }

    // Compact summary card for authenticated users with complete stored details (not in edit mode)
    if (isAuthenticated && hasStoredDetails) {
        const summaryDob = userData?.date_of_birth ? formatDob(userData.date_of_birth) : 'Not provided';
        const isUnder16ForSummary = calculateIsUnder16(userData?.date_of_birth || '');

        return (
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Select Provider
                    </button>
                    <h1 className="text-2xl font-semibold text-foreground mb-2">Patient Details</h1>
                    <p className="text-muted-foreground">Confirm your details below</p>
                </div>

                {/* Compact Summary Card */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Your Details</h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Full Name</div>
                            <div className="font-medium text-foreground">
                                {userData?.first_name} {userData?.last_name}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Email Address</div>
                            <div className="font-medium text-foreground">{userData?.email}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Phone Number</div>
                            <div className="font-medium text-foreground">
                                {userData?.phone || (
                                    <span className="text-muted-foreground italic">Not provided</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Date of Birth</div>
                            <div className="font-medium text-foreground">{summaryDob}</div>
                        </div>
                        {userData?.nhs_number && (
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">NHS Number</div>
                                <div className="font-medium text-foreground font-mono tracking-wider">
                                    {'******' + userData.nhs_number.slice(-4)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* NHS Number input (if NHS test and not already stored on profile) */}
                {isNhsTest && !userData?.nhs_number && (
                    <div className="space-y-2">
                        <label htmlFor="nhs-number-summary" className="text-sm font-medium text-foreground">
                            NHS Number <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="nhs-number-summary"
                            type="text"
                            value={nhsNumber}
                            onChange={(e) => setNhsNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="1234567890"
                            maxLength={10}
                        />
                        <p className="text-xs text-muted-foreground">Enter your 10-digit NHS number</p>
                    </div>
                )}

                {/* Guardian Fields (if under 16) */}
                {isUnder16ForSummary && (
                    <div
                        className="space-y-4 p-4 bg-accent/30 rounded-xl border border-border"
                        role="region"
                        aria-label="Guardian information required"
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-sm font-semibold text-foreground">
                                Guardian Information Required
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Since the patient is under 16 years old, a guardian must be present.
                        </p>
                        <div className="space-y-2">
                            <label htmlFor="guardian-name-summary" className="text-sm font-medium text-foreground">
                                Guardian Name (Adult with Parental Responsibility){' '}
                                <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="guardian-name-summary"
                                type="text"
                                value={guardianName}
                                onChange={(e) => setGuardianName(e.target.value)}
                                placeholder="Full name of parent or legal guardian"
                                aria-required="true"
                            />
                        </div>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="guardian-confirm-summary"
                                checked={guardianConfirmed}
                                onCheckedChange={(checked) => setGuardianConfirmed(checked === true)}
                                className="mt-0.5"
                                aria-required="true"
                            />
                            <label
                                htmlFor="guardian-confirm-summary"
                                className="text-sm text-muted-foreground cursor-pointer"
                            >
                                I confirm that I have parental responsibility for this child and will be
                                present at the blood draw. (We will need to check your ID)
                            </label>
                        </div>
                    </div>
                )}

                {/* Notes - always shown (per-booking field) */}
                <div className="space-y-2">
                    <label htmlFor="notes-summary" className="text-sm font-medium text-foreground">
                        Special Instructions (Optional)
                    </label>
                    <Textarea
                        id="notes-summary"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="E.g. specific collection requirements, accessibility needs, or previous issues with blood draws..."
                        rows={4}
                        className="resize-none placeholder:text-muted-foreground/60 placeholder:italic"
                    />
                </div>

                {/* Consent */}
                <div className="p-4 bg-accent/30 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground">
                        By continuing, you agree to our terms of service and consent to the
                        collection and processing of your personal data for the purpose of this
                        blood test appointment.
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-4">
                    <Button
                        onClick={handleContinueFromSummary}
                        className="w-full py-6 text-base"
                        size="lg"
                    >
                        Continue to Payment
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Select Provider
                </button>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Patient Details</h1>
                <p className="text-muted-foreground">
                    {showAuthGate
                        ? 'Sign in, create an account, or continue as guest'
                        : 'Please provide your information'}
                </p>
            </div>

            {/* Auth Gate - Only for unauthenticated users */}
            {showAuthGate && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                        How would you like to continue?
                    </h3>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
                        Your booking details will be saved. You'll return here after signing in or
                        creating an account.
                    </div>
                    <div className="grid gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/login?redirect=/book')}
                            className="w-full justify-start py-6 text-base"
                        >
                            <LogIn className="w-5 h-5 mr-3" />
                            <div className="text-left">
                                <div>Sign in to your account</div>
                                <div className="text-xs text-muted-foreground font-normal">
                                    Already have an account
                                </div>
                            </div>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/register?redirect=/book')}
                            className="w-full justify-start py-6 text-base"
                        >
                            <UserPlus className="w-5 h-5 mr-3" />
                            <div className="text-left">
                                <div>Create an account</div>
                                <div className="text-xs text-muted-foreground font-normal">
                                    Save your details for future bookings
                                </div>
                            </div>
                        </Button>
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">or</span>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleContinueAsGuest}
                            className="w-full justify-start py-6 text-base"
                        >
                            <Mail className="w-5 h-5 mr-3" />
                            <div className="text-left">
                                <div>Continue as guest</div>
                                <div className="text-xs text-muted-foreground font-normal">
                                    Enter your details below
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>
            )}

            {/* Authenticated User Flow */}
            {!showAuthGate && isAuthenticated && (
                <>
                    {/* Who is this booking for? Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                            Who is this booking for?
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {/* Myself */}
                            <button
                                type="button"
                                onClick={() => setSelectedOption('myself')}
                                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                                    selectedOption === 'myself'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                    <User className="size-5 text-primary" />
                                </div>
                                <div>
                                    <div className="font-medium">Myself</div>
                                    <div className="text-xs text-muted-foreground">
                                        {userData?.name}
                                    </div>
                                </div>
                            </button>

                            {/* Existing dependents */}
                            {dependents.map((dependent) => (
                                <button
                                    key={dependent.id}
                                    type="button"
                                    onClick={() => setSelectedOption(dependent.id)}
                                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                                        selectedOption === dependent.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                        <Users className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{dependent.full_name}</div>
                                        <div className="text-xs text-muted-foreground capitalize">
                                            {dependent.relationship}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* Add New */}
                            <button
                                type="button"
                                onClick={() => setSelectedOption('add-new')}
                                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                                    selectedOption === 'add-new'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50 border-dashed'
                                }`}
                            >
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                    <Plus className="size-5 text-primary" />
                                </div>
                                <div className="font-medium">Add New</div>
                            </button>
                        </div>
                    </div>

                    {/* Show summary for myself or existing dependent */}
                    {selectedOption !== 'add-new' && (
                        <>
                            {/* Read-only summary card */}
                            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Patient Information
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">
                                            Full Name
                                        </div>
                                        <div className="font-medium">
                                            {selectedOption === 'myself'
                                                ? userData?.name
                                                : dependents.find((d) => d.id === selectedOption)
                                                      ?.full_name}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">
                                            Date of Birth
                                        </div>
                                        <div className="font-medium">
                                            {selectedDob ? formatDob(selectedDob) : 'Not provided'}
                                        </div>
                                    </div>
                                    {selectedOption === 'myself' && (
                                        <>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    Email
                                                </div>
                                                <div className="font-medium">{userData?.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    Phone
                                                </div>
                                                <div className="font-medium">
                                                    {userData?.phone || 'Not provided'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {selectedOption !== 'myself' && (
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">
                                                Relationship
                                            </div>
                                            <div className="font-medium capitalize">
                                                {
                                                    dependents.find((d) => d.id === selectedOption)
                                                        ?.relationship
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* NHS Number (if NHS test) */}
                            {isNhsTest && (
                                <div className="space-y-2">
                                    <label htmlFor="nhs-number" className="text-sm font-medium text-foreground">
                                        NHS Number <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="nhs-number"
                                        type="text"
                                        value={nhsNumber}
                                        onChange={(e) => setNhsNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="1234567890"
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter your 10-digit NHS number
                                    </p>
                                </div>
                            )}

                            {/* Guardian Fields (if under 16) */}
                            {isUnder16 && (
                                <div
                                    className="space-y-4 p-4 bg-accent/30 rounded-xl border border-border transition-all duration-300 ease-in-out animate-in"
                                    role="region"
                                    aria-label="Guardian information required"
                                    aria-live="polite"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Guardian Information Required
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Since the patient is under 16 years old, a guardian must be
                                        present.
                                    </p>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="guardian-name"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            Guardian Name (Adult with Parental Responsibility){' '}
                                            <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="guardian-name"
                                            type="text"
                                            value={guardianName}
                                            onChange={(e) => setGuardianName(e.target.value)}
                                            placeholder="Full name of parent or legal guardian"
                                            aria-required="true"
                                        />
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="guardian-confirm"
                                            checked={guardianConfirmed}
                                            onCheckedChange={(checked) =>
                                                setGuardianConfirmed(checked === true)
                                            }
                                            className="mt-0.5"
                                            aria-required="true"
                                        />
                                        <label
                                            htmlFor="guardian-confirm"
                                            className="text-sm text-muted-foreground cursor-pointer"
                                        >
                                            I confirm that I have parental responsibility for this child
                                            and will be present at the blood draw. (We will need to check
                                            your ID)
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Special Instructions */}
                            <div className="space-y-2">
                                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                                    Special Instructions (Optional)
                                </label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="E.g. specific collection requirements, accessibility needs, or previous issues with blood draws..."
                                    rows={4}
                                    className="resize-none placeholder:text-muted-foreground/60 placeholder:italic"
                                />
                            </div>

                            {/* Consent */}
                            <div className="p-4 bg-accent/30 rounded-xl border border-border">
                                <p className="text-sm text-muted-foreground">
                                    By continuing, you agree to our terms of service and consent to the
                                    collection and processing of your personal data for the purpose of
                                    this blood test appointment.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 space-y-3">
                                <Button
                                    onClick={handleContinue}
                                    className="w-full py-6 text-base"
                                    size="lg"
                                >
                                    Continue to Payment
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Show form for adding new dependent */}
                    {selectedOption === 'add-new' && (
                        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">
                                Add New Dependent
                            </h3>

                            {/* First Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="dep-first-name"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        First Name <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="dep-first-name"
                                        type="text"
                                        value={newDependent.first_name}
                                        onChange={(e) =>
                                            setNewDependent((prev) => ({
                                                ...prev,
                                                first_name: e.target.value,
                                            }))
                                        }
                                        placeholder="John"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="dep-last-name"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Last Name <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="dep-last-name"
                                        type="text"
                                        value={newDependent.last_name}
                                        onChange={(e) =>
                                            setNewDependent((prev) => ({
                                                ...prev,
                                                last_name: e.target.value,
                                            }))
                                        }
                                        placeholder="Smith"
                                    />
                                </div>
                            </div>

                            {/* DOB */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="dep-dob"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Date of Birth <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    id="dep-dob"
                                    type="date"
                                    value={newDependent.date_of_birth}
                                    onChange={(e) =>
                                        setNewDependent((prev) => ({
                                            ...prev,
                                            date_of_birth: e.target.value,
                                        }))
                                    }
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Relationship */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="dep-relationship"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Relationship <span className="text-destructive">*</span>
                                </label>
                                <select
                                    id="dep-relationship"
                                    value={newDependent.relationship}
                                    onChange={(e) =>
                                        setNewDependent((prev) => ({
                                            ...prev,
                                            relationship: e.target.value as any,
                                        }))
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="child">Child</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="parent">Parent</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* NHS Number (optional) */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="dep-nhs-number"
                                    className="text-sm font-medium text-foreground"
                                >
                                    NHS Number (Optional)
                                </label>
                                <Input
                                    id="dep-nhs-number"
                                    type="text"
                                    value={newDependent.nhs_number}
                                    onChange={(e) =>
                                        setNewDependent((prev) => ({
                                            ...prev,
                                            nhs_number: e.target.value.replace(/\D/g, '').slice(0, 10),
                                        }))
                                    }
                                    placeholder="1234567890"
                                    maxLength={10}
                                />
                            </div>

                            {/* Save Button */}
                            <div className="pt-2">
                                <Button
                                    onClick={handleAddNewDependent}
                                    disabled={isAddingDependent}
                                    className="w-full"
                                >
                                    {isAddingDependent
                                        ? 'Saving...'
                                        : 'Save & Select Dependent'}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/**
 * Guest Form Component (unchanged from original logic)
 */
function GuestForm({ goBack }: { goBack: () => void }) {
    const { patientDetails, isNhsTest, setPatientDetails, setStep } = useBooking();

    const [details, setDetails] = useState<PatientDetailsData>({
        firstName: patientDetails?.firstName || '',
        lastName: patientDetails?.lastName || '',
        email: patientDetails?.email || '',
        phone: patientDetails?.phone || '',
        dateOfBirth: patientDetails?.dateOfBirth || '',
        nhsNumber: patientDetails?.nhsNumber || '',
        isUnder16: false,
        guardianName: patientDetails?.guardianName || '',
        guardianConfirmed: patientDetails?.guardianConfirmed || false,
        notes: patientDetails?.notes || '',
        isGuest: true,
    });

    const calculateIsUnder16 = (dob: string): boolean => {
        if (!dob) return false;

        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age < 16;
    };

    const isUnder16 = useMemo(
        () => calculateIsUnder16(details.dateOfBirth),
        [details.dateOfBirth]
    );

    const handleChange = (field: keyof PatientDetailsData, value: string | boolean) => {
        if (field === 'dateOfBirth' && typeof value === 'string') {
            const newIsUnder16 = calculateIsUnder16(value);
            setDetails((prev) => ({
                ...prev,
                dateOfBirth: value,
                isUnder16: newIsUnder16,
                guardianName: newIsUnder16 ? prev.guardianName : '',
                guardianConfirmed: newIsUnder16 ? prev.guardianConfirmed : false,
            }));
        } else {
            setDetails((prev) => ({ ...prev, [field]: value }));
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const cleaned = phone.replace(/[\s\-()]/g, '');
        return /^(\+?\d{10,15})$/.test(cleaned);
    };

    const validateNhsNumber = (nhsNumber: string): boolean => {
        const nhsRegex = /^\d{10}$/;
        return nhsRegex.test(nhsNumber.replace(/\s/g, ''));
    };

    const validateDateOfBirth = (dob: string): boolean => {
        if (!dob) return false;
        const date = new Date(dob);
        const now = new Date();
        return date < now;
    };

    const handleContinue = () => {
        if (!details.firstName.trim()) {
            toast.error('Please enter first name');
            return;
        }

        if (!details.lastName.trim()) {
            toast.error('Please enter last name');
            return;
        }

        if (!validateEmail(details.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (!validatePhone(details.phone)) {
            toast.error('Please enter a valid UK phone number');
            return;
        }

        if (!validateDateOfBirth(details.dateOfBirth)) {
            toast.error('Please enter a valid date of birth');
            return;
        }

        if (isNhsTest && !validateNhsNumber(details.nhsNumber || '')) {
            toast.error('Please enter a valid 10-digit NHS number');
            return;
        }

        if (details.isUnder16) {
            if (!details.guardianName?.trim()) {
                toast.error('Please enter guardian name');
                return;
            }
            if (!details.guardianConfirmed) {
                toast.error('Please confirm parental responsibility');
                return;
            }
        }

        setPatientDetails(details);
        setStep('payment');
    };

    const baseValidation =
        details.firstName.trim() &&
        details.lastName.trim() &&
        validateEmail(details.email) &&
        validatePhone(details.phone) &&
        validateDateOfBirth(details.dateOfBirth);

    const nhsValidation = !isNhsTest || validateNhsNumber(details.nhsNumber || '');

    const under16Validation =
        !details.isUnder16 || (details.guardianName?.trim() && details.guardianConfirmed);

    const isFormValid = baseValidation && nhsValidation && under16Validation;

    return (
        <div className="space-y-6">
            <div>
                <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Select Provider
                </button>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Patient Details</h1>
                <p className="text-muted-foreground">Please provide your information</p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="first-name" className="text-sm font-medium text-foreground">
                        First Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="first-name"
                        type="text"
                        value={details.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="John"
                        aria-required="true"
                        aria-invalid={!details.firstName.trim()}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="last-name" className="text-sm font-medium text-foreground">
                        Last Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="last-name"
                        type="text"
                        value={details.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Smith"
                        aria-required="true"
                        aria-invalid={!details.lastName.trim()}
                    />
                </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={details.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john.smith@example.com"
                        aria-required="true"
                        aria-invalid={!validateEmail(details.email)}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Phone Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="phone"
                        type="tel"
                        value={details.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="07XXX XXXXXX"
                        aria-required="true"
                        aria-invalid={!validatePhone(details.phone)}
                    />
                </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
                <label htmlFor="dob" className="text-sm font-medium text-foreground">
                    Date of Birth <span className="text-destructive">*</span>
                </label>
                <Input
                    id="dob"
                    type="date"
                    value={details.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    aria-required="true"
                />
            </div>

            {/* Guardian Fields (if under 16) */}
            {isUnder16 && (
                <div
                    className="space-y-4 p-4 bg-accent/30 rounded-xl border border-border transition-all duration-300 ease-in-out animate-in"
                    role="region"
                    aria-label="Guardian information required"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-sm font-semibold text-foreground">
                            Guardian Information Required
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        Since the patient is under 16 years old, a guardian must be present.
                    </p>

                    <div className="space-y-2">
                        <label
                            htmlFor="guardian-name"
                            className="text-sm font-medium text-foreground"
                        >
                            Guardian Name (Adult with Parental Responsibility){' '}
                            <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="guardian-name"
                            type="text"
                            value={details.guardianName || ''}
                            onChange={(e) => handleChange('guardianName', e.target.value)}
                            placeholder="Full name of parent or legal guardian"
                            aria-required="true"
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="guardian-confirm"
                            checked={details.guardianConfirmed || false}
                            onCheckedChange={(checked) =>
                                handleChange('guardianConfirmed', checked === true)
                            }
                            className="mt-0.5"
                            aria-required="true"
                        />
                        <label
                            htmlFor="guardian-confirm"
                            className="text-sm text-muted-foreground cursor-pointer"
                        >
                            I confirm that I have parental responsibility for this child and will be
                            present at the blood draw. (We will need to check your ID)
                        </label>
                    </div>
                </div>
            )}

            {/* NHS Number (if NHS test) */}
            {isNhsTest && (
                <div className="space-y-2">
                    <label htmlFor="nhs-number" className="text-sm font-medium text-foreground">
                        NHS Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="nhs-number"
                        type="text"
                        value={details.nhsNumber || ''}
                        onChange={(e) =>
                            handleChange(
                                'nhsNumber',
                                e.target.value.replace(/\D/g, '').slice(0, 10)
                            )
                        }
                        placeholder="1234567890"
                        maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">Enter your 10-digit NHS number</p>
                </div>
            )}

            {/* Special Instructions */}
            <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                    Special Instructions (Optional)
                </label>
                <Textarea
                    id="notes"
                    value={details.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="E.g. specific collection requirements, accessibility needs, or previous issues with blood draws..."
                    rows={4}
                    className="resize-none placeholder:text-muted-foreground/60 placeholder:italic"
                />
            </div>

            {/* Consent */}
            <div className="p-4 bg-accent/30 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">
                    By continuing, you agree to our terms of service and consent to the collection
                    and processing of your personal data for the purpose of this blood test
                    appointment.
                </p>
            </div>

            {/* Actions */}
            <div className="pt-4">
                <Button
                    onClick={handleContinue}
                    disabled={!isFormValid}
                    className="w-full py-6 text-base"
                    size="lg"
                >
                    Continue to Payment
                </Button>
            </div>
        </div>
    );
}
