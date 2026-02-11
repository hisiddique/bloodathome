import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, LogIn, UserPlus, Mail, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBooking, type PatientDetailsData } from '@/contexts/booking-context';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

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
    userData?: { name: string; email: string; phone?: string };
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
    const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);

    const [details, setDetails] = useState<PatientDetailsData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nhsNumber: '',
        isUnder16: false,
        guardianName: '',
        guardianConfirmed: false,
        notes: '',
        isGuest: false,
    });

    // Pre-fill from existing patient details or user data
    useEffect(() => {
        if (patientDetails) {
            setDetails(patientDetails);
        } else if (userData) {
            const [firstName, ...lastNameParts] = userData.name.split(' ');
            setDetails((prev) => ({
                ...prev,
                firstName: firstName || '',
                lastName: lastNameParts.join(' ') || '',
                email: userData.email || '',
                phone: userData.phone || '',
            }));
        }
    }, [patientDetails, userData]);

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

    // Auto-detect if patient is under 16 whenever DOB changes
    const isUnder16 = useMemo(() => calculateIsUnder16(details.dateOfBirth), [details.dateOfBirth]);

    const handleChange = (field: keyof PatientDetailsData, value: string | boolean) => {
        if (field === 'dateOfBirth' && typeof value === 'string') {
            // When DOB changes, automatically update isUnder16
            const newIsUnder16 = calculateIsUnder16(value);
            setDetails((prev) => ({
                ...prev,
                dateOfBirth: value,
                isUnder16: newIsUnder16,
                // Clear guardian fields if no longer under 16
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
        // Accept UK numbers (mobile/landline) and international formats
        // Minimum 10 digits, allows +, spaces, dashes, parentheses
        const cleaned = phone.replace(/[\s\-()]/g, '');
        return /^(\+?\d{10,15})$/.test(cleaned);
    };

    const validateNhsNumber = (nhsNumber: string): boolean => {
        // NHS number is 10 digits
        const nhsRegex = /^\d{10}$/;
        return nhsRegex.test(nhsNumber.replace(/\s/g, ''));
    };

    const validateDateOfBirth = (dob: string): boolean => {
        if (!dob) return false;
        const date = new Date(dob);
        const now = new Date();
        return date < now;
    };

    const handleContinueAsGuest = () => {
        setContinueAsGuest(true);
        setShowAuthGate(false);
        setDetails((prev) => ({ ...prev, isGuest: true }));
    };

    const handleDependentSelection = (dependentId: string | null) => {
        setSelectedDependentId(dependentId);

        if (dependentId === null) {
            // "Myself" selected - pre-fill with user data
            if (userData) {
                const [firstName, ...lastNameParts] = userData.name.split(' ');
                setDetails({
                    firstName: firstName || '',
                    lastName: lastNameParts.join(' ') || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    dateOfBirth: '',
                    nhsNumber: '',
                    isUnder16: false,
                    guardianName: '',
                    guardianConfirmed: false,
                    notes: '',
                    isGuest: false,
                    dependentId: null,
                });
            }
        } else {
            // Dependent selected - pre-fill with dependent data
            const dependent = userDependents.find(d => d.id === dependentId);
            if (dependent) {
                setDetails({
                    firstName: dependent.first_name,
                    lastName: dependent.last_name,
                    email: userData?.email || '',
                    phone: userData?.phone || '',
                    dateOfBirth: dependent.date_of_birth,
                    nhsNumber: dependent.nhs_number || '',
                    isUnder16: calculateIsUnder16(dependent.date_of_birth),
                    guardianName: '',
                    guardianConfirmed: false,
                    notes: '',
                    isGuest: false,
                    dependentId: dependent.id,
                });
            }
        }
    };

    const handleContinue = () => {
        // Validate required fields
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

        // NHS number validation
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

    const baseValidation =
        details.firstName.trim() &&
        details.lastName.trim() &&
        validateEmail(details.email) &&
        validatePhone(details.phone) &&
        validateDateOfBirth(details.dateOfBirth);

    const nhsValidation = !isNhsTest || validateNhsNumber(details.nhsNumber || '');

    const under16Validation = !details.isUnder16 || (details.guardianName?.trim() && details.guardianConfirmed);

    const isFormValid = baseValidation && nhsValidation && under16Validation;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Select Provider
                </button>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Patient Details</h1>
                <p className="text-muted-foreground">
                    {showAuthGate ? 'Sign in, create an account, or continue as guest' : 'Please provide your information'}
                </p>
            </div>

            {/* Auth Gate - Only for unauthenticated users */}
            {showAuthGate && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How would you like to continue?</h3>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
                        Your booking details will be saved. You'll return here after signing in or creating an account.
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
                                <div className="text-xs text-muted-foreground font-normal">Already have an account</div>
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
                                <div className="text-xs text-muted-foreground font-normal">Save your details for future bookings</div>
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
                                <div className="text-xs text-muted-foreground font-normal">Enter your details below</div>
                            </div>
                        </Button>
                    </div>
                </div>
            )}

            {/* Patient Details Form - Only show when authenticated or guest mode selected */}
            {!showAuthGate && (
                <>
            {/* Dependent Selector - Only for authenticated users with dependents */}
            {isAuthenticated && userDependents.length > 0 && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                        Who is this booking for?
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => handleDependentSelection(null)}
                            className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                                selectedDependentId === null
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                            }`}
                        >
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                                <User className="size-4 text-primary" />
                            </div>
                            <span className="font-medium">Myself</span>
                        </button>
                        {userDependents.map((dependent) => (
                            <button
                                key={dependent.id}
                                type="button"
                                onClick={() => handleDependentSelection(dependent.id)}
                                className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                                    selectedDependentId === dependent.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                                    <Users className="size-4 text-primary" />
                                </div>
                                <span className="font-medium">{dependent.full_name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Guardian Fields (if under 16) - Auto-detected from DOB */}
            {isUnder16 && (
                <div
                    className="space-y-4 p-4 bg-accent/30 rounded-xl border border-border transition-all duration-300 ease-in-out animate-in"
                    role="region"
                    aria-label="Guardian information required"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-sm font-semibold text-foreground">Guardian Information Required</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        Since the patient is under 16 years old, a guardian must be present.
                    </p>

                    <div className="space-y-2">
                        <label htmlFor="guardian-name" className="text-sm font-medium text-foreground">
                            Guardian Name (Adult with Parental Responsibility) <span className="text-destructive">*</span>
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
                            onCheckedChange={(checked) => handleChange('guardianConfirmed', checked === true)}
                            className="mt-0.5"
                            aria-required="true"
                        />
                        <label htmlFor="guardian-confirm" className="text-sm text-muted-foreground cursor-pointer">
                            I confirm that I have parental responsibility for this child and will be present at the blood
                            draw. (We will need to check your ID)
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
                        onChange={(e) => handleChange('nhsNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                    By continuing, you agree to our terms of service and consent to the collection and processing of your
                    personal data for the purpose of this blood test appointment.
                </p>
            </div>

            {/* Actions */}
            <div className="pt-4">
                <Button onClick={handleContinue} disabled={!isFormValid} className="w-full py-6 text-base" size="lg">
                    Continue to Payment
                </Button>
            </div>
            </>
            )}
        </div>
    );
}
