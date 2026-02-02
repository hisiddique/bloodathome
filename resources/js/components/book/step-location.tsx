import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooking } from '@/contexts/booking-context';
import { type UserAddress, type PlaceResult } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StepLocationProps {
    userAddresses?: UserAddress[];
    googleMapsKey?: string;
}

const timeSlots = [
    { value: 'morning', label: 'Morning', description: '6:00 AM - 12:00 PM' },
    { value: 'afternoon', label: 'Afternoon', description: '12:00 PM - 6:00 PM' },
    { value: 'evening', label: 'Evening', description: '6:00 PM - 9:00 PM' },
];

export function StepLocation({ userAddresses = [], googleMapsKey }: StepLocationProps) {
    const {
        location,
        selectedDate,
        timeOfDay,
        setLocation,
        setSelectedDate,
        setTimeOfDay,
        setStep,
        goBack,
    } = useBooking();

    const [postcodeInput, setPostcodeInput] = useState(location?.postcode || '');
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Validate UK postcode
    const validatePostcode = (postcode: string): boolean => {
        const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
        return ukPostcodeRegex.test(postcode.trim());
    };

    const handleAddressSelect = (addressId: string) => {
        if (addressId === 'new') {
            setSelectedAddressId('new');
            setPostcodeInput('');
            setLocation(null);
            return;
        }

        const address = userAddresses.find((a) => a.id === addressId);
        if (address) {
            setSelectedAddressId(addressId);
            setPostcodeInput(address.postcode);
            // For saved addresses, we'll geocode the postcode
            handleGeocodePostcode(address.postcode);
        }
    };

    const handleGeocodePostcode = async (postcode: string) => {
        if (!validatePostcode(postcode)) {
            toast.error('Please enter a valid UK postcode');
            return;
        }

        setIsLoadingLocation(true);
        try {
            // Using UK Postcode API (free, no key required)
            const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
            const data = await response.json();

            if (data.status === 200 && data.result) {
                setLocation({
                    postcode: postcode.toUpperCase(),
                    lat: data.result.latitude,
                    lng: data.result.longitude,
                    address: `${data.result.admin_district}, ${data.result.region}`,
                });
                toast.success('Location found');
            } else {
                toast.error('Postcode not found. Please check and try again.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Failed to find location. Please try again.');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleContinue = () => {
        if (!location) {
            toast.error('Please enter a valid postcode');
            return;
        }

        if (!selectedDate) {
            toast.error('Please select a date');
            return;
        }

        if (!timeOfDay) {
            toast.error('Please select a time of day');
            return;
        }

        setStep('provider');
    };

    // Disable past dates
    const disabledDates = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Location & Schedule</h1>
                <p className="text-muted-foreground">When and where would you like your test?</p>
            </div>

            {/* Saved Addresses (if user is logged in) */}
            {userAddresses.length > 0 && (
                <div className="space-y-2">
                    <label htmlFor="saved-address" className="text-sm font-medium text-foreground">
                        Saved Addresses
                    </label>
                    <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                        <SelectTrigger id="saved-address" className="h-12">
                            <SelectValue placeholder="Select a saved address or enter new" />
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
                            <SelectItem value="new">
                                <div className="font-medium">Enter new postcode</div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Postcode Input */}
            <div className="space-y-2">
                <label htmlFor="postcode" className="text-sm font-medium text-foreground">
                    Postcode <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            id="postcode"
                            type="text"
                            placeholder="e.g. SW1A 1AA"
                            value={postcodeInput}
                            onChange={(e) => setPostcodeInput(e.target.value.toUpperCase())}
                            className="w-full h-12 pl-11 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={() => handleGeocodePostcode(postcodeInput)}
                        disabled={isLoadingLocation || !postcodeInput.trim()}
                        className="h-12 px-6"
                    >
                        {isLoadingLocation ? 'Finding...' : 'Find'}
                    </Button>
                </div>
                {location && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <MapPin className="w-4 h-4" />
                        <span>Location confirmed: {location.address || location.postcode}</span>
                    </div>
                )}
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Preferred Date <span className="text-destructive">*</span>
                </label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'w-full h-12 justify-start text-left font-normal',
                                !selectedDate && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate || undefined}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={disabledDates}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Time of Day Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Time of Day <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                        <button
                            key={slot.value}
                            type="button"
                            onClick={() => setTimeOfDay(slot.value as 'morning' | 'afternoon' | 'evening')}
                            className={cn(
                                'p-4 rounded-xl border-2 transition-all text-left',
                                timeOfDay === slot.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                        timeOfDay === slot.value ? 'bg-primary' : 'bg-muted'
                                    )}
                                >
                                    <Clock
                                        className={cn(
                                            'w-5 h-5',
                                            timeOfDay === slot.value ? 'text-primary-foreground' : 'text-foreground'
                                        )}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-foreground">{slot.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{slot.description}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Note */}
            <div className="p-4 bg-accent/30 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Exact time slots will be shown in the next step
                    based on provider availability.
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" onClick={goBack} className="sm:w-auto w-full py-6">
                    Back
                </Button>
                <Button
                    onClick={handleContinue}
                    disabled={!location || !selectedDate || !timeOfDay}
                    className="flex-1 py-6 text-base"
                    size="lg"
                >
                    Continue to Provider Selection
                </Button>
            </div>
        </div>
    );
}
