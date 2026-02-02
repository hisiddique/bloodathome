import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooking, type PatientDetailsData } from '@/contexts/booking-context';
import { type UserAddress } from '@/types';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StepPatientProps {
    userData?: { name: string; email: string; phone?: string };
    userAddresses?: UserAddress[];
}

export function StepPatient({ userData, userAddresses = [] }: StepPatientProps) {
    const {
        patientDetails,
        isNhsTest,
        setPatientDetails,
        setStep,
        goBack,
    } = useBooking();

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
    });

    const [selectedAddressId, setSelectedAddressId] = useState<string>('');

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

        // Pre-select default address
        const defaultAddress = userAddresses.find((addr) => addr.is_default);
        if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
        }
    }, [patientDetails, userData, userAddresses]);

    const handleChange = (field: keyof PatientDetailsData, value: string | boolean) => {
        setDetails((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressSelect = (addressId: string) => {
        setSelectedAddressId(addressId);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
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
                <h1 className="text-2xl font-semibold text-foreground mb-2">Patient Details</h1>
                <p className="text-muted-foreground">Please provide your information</p>
            </div>

            {/* Under 16 Toggle */}
            <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-xl border border-border">
                <Checkbox
                    id="under-16"
                    checked={details.isUnder16}
                    onCheckedChange={(checked) => handleChange('isUnder16', checked === true)}
                />
                <label htmlFor="under-16" className="text-sm text-foreground cursor-pointer flex-1">
                    Patient is under 16 years old
                </label>
            </div>

            {/* Guardian Fields (if under 16) */}
            {details.isUnder16 && (
                <div className="space-y-4 p-4 bg-accent/30 rounded-xl border border-border">
                    <h3 className="text-sm font-semibold text-foreground">Guardian Information</h3>

                    <div className="space-y-2">
                        <label htmlFor="guardian-name" className="text-sm font-medium text-foreground">
                            Guardian Name (Adult with Parental Responsibility) <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="guardian-name"
                            type="text"
                            value={details.guardianName || ''}
                            onChange={(e) => handleChange('guardianName', e.target.value)}
                            placeholder="Full name"
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="guardian-confirm"
                            checked={details.guardianConfirmed || false}
                            onCheckedChange={(checked) => handleChange('guardianConfirmed', checked === true)}
                            className="mt-0.5"
                        />
                        <label htmlFor="guardian-confirm" className="text-sm text-muted-foreground cursor-pointer">
                            I confirm that I have parental responsibility for this child and will be present at the blood
                            draw. (We will need to check your ID)
                        </label>
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
                />
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
                        value={details.nhsNumber || ''}
                        onChange={(e) => handleChange('nhsNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="1234567890"
                        maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">Enter your 10-digit NHS number</p>
                </div>
            )}

            {/* Saved Addresses */}
            {userAddresses.length > 0 && (
                <div className="space-y-2">
                    <label htmlFor="saved-address" className="text-sm font-medium text-foreground">
                        Saved Addresses
                    </label>
                    <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                        <SelectTrigger id="saved-address">
                            <SelectValue placeholder="Select address or skip" />
                        </SelectTrigger>
                        <SelectContent>
                            {userAddresses.map((address) => (
                                <SelectItem key={address.id} value={address.id}>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                                        <div className="flex-1">
                                            <div className="font-medium">{address.label}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {address.address_line1}, {address.town_city}, {address.postcode}
                                            </div>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    placeholder="Please tell us anything else we might need to know about your requirements including: details about specific collection(s), availability or accessibility restrictions, or previous problems you may have had having your blood taken."
                    rows={4}
                    className="resize-none"
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
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" onClick={goBack} className="sm:w-auto w-full py-6">
                    Back
                </Button>
                <Button onClick={handleContinue} disabled={!isFormValid} className="flex-1 py-6 text-base" size="lg">
                    Continue to Payment
                </Button>
            </div>
        </div>
    );
}
