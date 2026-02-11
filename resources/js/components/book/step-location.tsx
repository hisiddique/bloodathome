import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar as CalendarIcon, MapPin, Navigation, Map, Loader2, ChevronDown, ChevronUp, Home, Check } from 'lucide-react';
import { StepBackLink } from './step-back-link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AutoDismissAlert } from '@/components/ui/auto-dismiss-alert';
import { Input } from '@/components/ui/input';
import { IconInput } from '@/components/ui/icon-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useBooking } from '@/contexts/booking-context';
import { useBookingApi } from '@/hooks/use-booking-api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { type UserAddress } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LocationSelectorMap } from '@/components/ui/location-selector-map';

interface StepLocationProps {
    userAddresses?: UserAddress[];
    googleMapsKey?: string;
    isAuthenticated?: boolean;
}

export function StepLocation({ userAddresses = [], googleMapsKey, isAuthenticated = false }: StepLocationProps) {
    const {
        location,
        selectedDate,
        selectedServices,
        collectionType,
        setLocation,
        setSelectedDate,
        setStep,
        goBack,
    } = useBooking();

    const { searchProviders } = useBookingApi();
    const { isLoaded: isGoogleMapsLoaded, libraries } = useGoogleMaps(googleMapsKey);

    // Address mode: 'saved' or 'new'
    const [addressMode, setAddressMode] = useState<'saved' | 'new'>(
        userAddresses.length > 0 ? 'saved' : 'new'
    );
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [showMapSelector, setShowMapSelector] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationNotSupported, setLocationNotSupported] = useState(false);
    const [isCheckingProviders, setIsCheckingProviders] = useState(false);
    const [noProvidersError, setNoProvidersError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
        location ? { lat: location.lat, lng: location.lng } : { lat: 51.5074, lng: -0.1278 } // Default to London
    );

    // Address fields (for KYC - required for all collection types)
    const [addressLine1, setAddressLine1] = useState(location?.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(location?.addressLine2 || '');
    const [townCity, setTownCity] = useState(location?.townCity || '');
    const [showAddressFields, setShowAddressFields] = useState(!!location?.postcode);

    // Save address state
    const [saveAddress, setSaveAddress] = useState(false);
    const [addressLabel, setAddressLabel] = useState('');
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // Google Places Autocomplete (New Suggestions API)
    const [addressInput, setAddressInput] = useState('');
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Validate UK postcode
    const validatePostcode = (postcode: string): boolean => {
        const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
        return ukPostcodeRegex.test(postcode.trim());
    };

    // Helper to populate address from Google Place (New API)
    const populateAddressFromPlace = async (place: google.maps.places.Place) => {
        if (!place.addressComponents || !place.location) {
            toast.error('Could not get address details');
            return;
        }

        const components = place.addressComponents;
        let streetNumber = '';
        let route = '';
        let subpremise = '';
        let locality = '';
        let postalTown = '';
        let postcode = '';

        // Extract address components
        for (const component of components) {
            if (component.types.includes('street_number')) {
                streetNumber = component.longText || '';
            }
            if (component.types.includes('route')) {
                route = component.longText || '';
            }
            if (component.types.includes('subpremise')) {
                subpremise = component.longText || '';
            }
            if (component.types.includes('locality')) {
                locality = component.longText || '';
            }
            if (component.types.includes('postal_town')) {
                postalTown = component.longText || '';
            }
            if (component.types.includes('postal_code')) {
                postcode = component.longText || '';
            }
        }

        // Build address line 1
        const line1Parts = [streetNumber, route].filter(Boolean);
        const line1 = line1Parts.join(' ');

        // Address line 2 (flat/unit number)
        const line2 = subpremise;

        // Town/City (prefer postal_town for UK addresses)
        const city = postalTown || locality;

        // Get coordinates
        const lat = place.location.lat();
        const lng = place.location.lng();

        // Update all fields
        setAddressLine1(line1);
        setAddressLine2(line2);
        setTownCity(city);

        const newLocation = {
            postcode: postcode,
            lat,
            lng,
            address: `${city}`,
            addressLine1: line1,
            addressLine2: line2,
            townCity: city,
        };

        setLocation(newLocation);
        setMapCenter({ lat, lng });
        setLocationNotSupported(false);
        setShowAddressFields(true);

        toast.success('Address found');
    };

    // Reverse geocode using Google Maps Geocoding API
    // Returns true if location is in the UK, false otherwise
    const reverseGeocodeWithGoogle = async (lat: number, lng: number): Promise<boolean> => {
        if (!isGoogleMapsLoaded || !libraries) {
            toast.error('Google Maps is not loaded');
            return false;
        }

        try {
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({
                location: { lat, lng },
            });

            if (response.results && response.results.length > 0) {
                const result = response.results[0];

                // Check if the location is in the UK
                const countryComponent = result.address_components.find(c => c.types.includes('country'));
                if (!countryComponent || countryComponent.short_name !== 'GB') {
                    setLocationNotSupported(true);
                    return false;
                }

                // Convert GeocoderResult to Place object format
                const place = {
                    addressComponents: result.address_components.map(comp => ({
                        longText: comp.long_name,
                        shortText: comp.short_name,
                        types: comp.types,
                    })),
                    location: result.geometry.location,
                } as google.maps.places.Place;

                await populateAddressFromPlace(place);
                return true;
            } else {
                // Fallback to UK Postcode API
                await reverseGeocodeWithPostcodeAPI(lat, lng);
                return !locationNotSupported;
            }
        } catch (error) {
            console.error('Google reverse geocoding error:', error);
            // Fallback to UK Postcode API
            await reverseGeocodeWithPostcodeAPI(lat, lng);
            return !locationNotSupported;
        }
    };

    // Fallback: Reverse geocode using UK Postcode API
    const reverseGeocodeWithPostcodeAPI = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1`
            );

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 200 && data.result && data.result.length > 0) {
                const result = data.result[0];
                const newLocation = {
                    postcode: result.postcode,
                    lat: result.latitude,
                    lng: result.longitude,
                    address: `${result.admin_district || ''}, ${result.region || ''}`.replace(/^, |, $/g, ''),
                    addressLine1: '',
                    addressLine2: '',
                    townCity: '',
                };
                setLocation(newLocation);
                setMapCenter({ lat: newLocation.lat, lng: newLocation.lng });
                setLocationNotSupported(false);
                setShowAddressFields(true);
            } else {
                // Location outside UK or not found
                setLocationNotSupported(true);
            }
        } catch (error) {
            console.error('Postcode API error:', error);
            setLocationNotSupported(true);
        }
    };

    // Initialize session token for billing optimization
    useEffect(() => {
        if (isGoogleMapsLoaded && !sessionToken) {
            const initSessionToken = async () => {
                try {
                    const { AutocompleteSessionToken } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
                    setSessionToken(new AutocompleteSessionToken());
                } catch (error) {
                    console.error('Error creating session token:', error);
                }
            };
            initSessionToken();
        }
    }, [isGoogleMapsLoaded, sessionToken]);

    // Fetch autocomplete suggestions with debounce
    const fetchSuggestions = useCallback(async (input: string) => {
        if (!isGoogleMapsLoaded || !sessionToken || input.length < 5) {
            setSuggestions([]);
            return;
        }

        setIsLoadingSuggestions(true);

        try {
            const { AutocompleteSuggestion } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

            const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input,
                sessionToken,
                includedRegionCodes: ['gb'],
            });

            setSuggestions(response.suggestions || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, [isGoogleMapsLoaded, sessionToken]);

    // Handle address input change with debounce
    const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddressInput(value);

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Don't fetch if less than 5 characters
        if (value.length < 5) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Debounce the API call
        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 500);
    };

    // Handle suggestion selection
    const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
        if (!suggestion.placePrediction) {
            toast.error('Invalid suggestion');
            return;
        }

        try {
            // Convert prediction to Place
            const place = suggestion.placePrediction.toPlace();

            // Fetch address details
            await place.fetchFields({
                fields: ['addressComponents', 'location', 'formattedAddress']
            });

            if (!place.location) {
                toast.error('No location details available for this address');
                return;
            }

            // Populate address
            await populateAddressFromPlace(place);

            // Update input value
            const mainText = suggestion.placePrediction.structuredFormat?.mainText?.text || suggestion.placePrediction.text?.text || '';
            setAddressInput(mainText);

            // Hide suggestions
            setShowSuggestions(false);
            setSuggestions([]);

            // Create new session token for next session
            const { AutocompleteSessionToken } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
            setSessionToken(new AutocompleteSessionToken());
        } catch (error) {
            console.error('Error selecting suggestion:', error);
            toast.error('Failed to get address details');
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close suggestions on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSavedAddressSelect = (address: UserAddress) => {
        setSelectedAddressId(address.id);
        setAddressLine1(address.address_line1);
        setAddressLine2(address.address_line2 || '');
        setTownCity(address.town_city);
        // For saved addresses, we'll geocode the postcode
        handleGeocodePostcode(address.postcode, address.address_line1, address.address_line2, address.town_city);
    };

    const handleGeocodePostcode = async (
        postcode: string,
        line1?: string,
        line2?: string,
        city?: string
    ) => {
        if (!validatePostcode(postcode)) {
            toast.error('Please enter a valid UK postcode');
            return;
        }

        try {
            // Using UK Postcode API (free, no key required)
            const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
            const data = await response.json();

            if (data.status === 200 && data.result) {
                const newLocation = {
                    postcode: postcode.toUpperCase(),
                    lat: data.result.latitude,
                    lng: data.result.longitude,
                    address: `${data.result.admin_district}, ${data.result.region}`,
                    addressLine1: line1 || '',
                    addressLine2: line2 || '',
                    townCity: city || '',
                };
                setLocation(newLocation);
                setMapCenter({ lat: newLocation.lat, lng: newLocation.lng });
                setLocationNotSupported(false);
                setShowAddressFields(true);

                toast.success('Location found');
            } else {
                toast.error('Postcode not found. Please check and try again.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Failed to find location. Please try again.');
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsGettingLocation(true);
        toast.loading('Getting your location...', { id: 'getting-location' });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                try {
                    let isSupported = false;

                    // Use Google reverse geocoding if available
                    if (isGoogleMapsLoaded && libraries) {
                        isSupported = await reverseGeocodeWithGoogle(lat, lng);
                    } else {
                        // Fallback to UK Postcode API
                        await reverseGeocodeWithPostcodeAPI(lat, lng);
                        isSupported = !locationNotSupported;
                    }

                    if (isSupported) {
                        toast.success('Current location found', { id: 'getting-location' });
                    } else {
                        toast.error('Your location is outside the UK. Please enter a UK address manually.', { id: 'getting-location' });
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    setLocationNotSupported(true);
                    toast.error('Your location is outside the UK. Please enter a UK address manually.', { id: 'getting-location' });
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Failed to get your location';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable. Please try again or enter postcode manually.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                }

                toast.error(errorMessage, { id: 'getting-location' });
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: false, // Start with low accuracy for faster response
                timeout: 15000, // Increased timeout
                maximumAge: 60000, // Allow cached position up to 1 minute old
            }
        );
    };

    const handleMapLocationSelect = async (coords: { lat: number; lng: number }) => {
        try {
            let isSupported = false;

            // Use Google reverse geocoding if available
            if (isGoogleMapsLoaded && libraries) {
                isSupported = await reverseGeocodeWithGoogle(coords.lat, coords.lng);
            } else {
                // Fallback to UK Postcode API
                await reverseGeocodeWithPostcodeAPI(coords.lat, coords.lng);
                isSupported = !locationNotSupported;
            }

            if (!isSupported) {
                toast.error('This location is outside the UK. Please select a UK location.');
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            setLocationNotSupported(true);
            toast.error('This location is outside the UK. Please select a UK location.');
        }
    };

    const handleContinue = async () => {
        if (!location) {
            toast.error('Please enter a valid address');
            return;
        }

        // Validate full address (required for KYC)
        if (!addressLine1.trim()) {
            toast.error('Please enter your street address');
            return;
        }
        if (!townCity.trim()) {
            toast.error('Please enter your town/city');
            return;
        }

        // Update location with full address details
        setLocation({
            ...location,
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(),
            townCity: townCity.trim(),
        });

        if (!selectedDate) {
            toast.error('Please select a date');
            return;
        }

        // Save address if checkbox is checked and we're in new address mode
        if (saveAddress && addressLabel.trim() && isAuthenticated && addressMode === 'new') {
            setIsSavingAddress(true);
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

                await fetch('/api/addresses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        label: addressLabel.trim(),
                        address_line1: addressLine1.trim(),
                        address_line2: addressLine2.trim() || null,
                        town_city: townCity.trim(),
                        postcode: location.postcode,
                    }),
                });

                toast.success('Address saved for future bookings');
            } catch (error) {
                // Don't block the flow
                console.error('Failed to save address:', error);
            } finally {
                setIsSavingAddress(false);
            }
        }

        // Quick check for providers availability
        setIsCheckingProviders(true);
        setNoProvidersError(null);

        try {
            // Check for providers within 10km first
            const providers10km = await searchProviders({
                lat: location.lat,
                lng: location.lng,
                service_ids: selectedServices.map(s => s.id),
                collection_type: collectionType || undefined,
                radius_km: 10,
            });

            if (providers10km.length > 0) {
                setStep('provider');
                return;
            }

            // If no providers within 10km, check 25km
            const providers25km = await searchProviders({
                lat: location.lat,
                lng: location.lng,
                service_ids: selectedServices.map(s => s.id),
                collection_type: collectionType || undefined,
                radius_km: 25,
            });

            if (providers25km.length > 0) {
                setStep('provider');
                return;
            }

            // No providers found in either radius
            setNoProvidersError('No providers available in your area. Please try a different location or check back later.');
        } catch (error) {
            console.error('Error checking providers:', error);
            // On error, proceed anyway - the provider step will handle it
            setStep('provider');
        } finally {
            setIsCheckingProviders(false);
        }
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
                <StepBackLink label="Back to Choose Your Test" onClick={goBack} />
                <h1 className="text-2xl font-semibold text-foreground mb-2">Location & Date</h1>
                <p className="text-muted-foreground">Where and when would you like your test?</p>
            </div>

            {/* Location Not Supported Alert */}
            {locationNotSupported && (
                <AutoDismissAlert
                    title="Location not supported"
                    message="Our service is currently only available in the United Kingdom. Your detected location appears to be outside the UK. Please enter a valid UK postcode manually."
                    onDismiss={() => setLocationNotSupported(false)}
                />
            )}

            {/* Address Mode Tabs (for authenticated users with saved addresses) */}
            {isAuthenticated && userAddresses.length > 0 && (
                <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                        <button
                            type="button"
                            onClick={() => {
                                setAddressMode('saved');
                                setSaveAddress(false);
                                setAddressLabel('');
                            }}
                            className={cn(
                                'flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all',
                                addressMode === 'saved'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Saved Addresses
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setAddressMode('new');
                                setSelectedAddressId('');
                                setAddressLine1('');
                                setAddressLine2('');
                                setTownCity('');
                                setShowAddressFields(false);
                                setLocation(null);
                            }}
                            className={cn(
                                'flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all',
                                addressMode === 'new'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            New Address
                        </button>
                    </div>

                    {/* Saved Addresses Grid */}
                    {addressMode === 'saved' && (
                        <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {userAddresses.map((address) => {
                                const isSelected = selectedAddressId === address.id;
                                return (
                                    <button
                                        key={address.id}
                                        type="button"
                                        onClick={() => handleSavedAddressSelect(address)}
                                        className={cn(
                                            'p-4 rounded-xl border cursor-pointer transition-all text-left',
                                            isSelected
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-foreground mb-1">
                                                    {address.label}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {address.address_line1}
                                                    {address.address_line2 && `, ${address.address_line2}`}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {address.town_city}, {address.postcode}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {address.is_default && (
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                                {isSelected && (
                                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Location Input - Only show in 'new' mode or when user has no saved addresses */}
            {(addressMode === 'new' || userAddresses.length === 0) && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <label htmlFor="address-search" className="text-sm font-medium text-foreground">
                    Your Address <span className="text-destructive">*</span>
                </label>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex-1 h-11"
                    >
                        {isGettingLocation ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Getting Location...
                            </>
                        ) : (
                            <>
                                <Navigation className="mr-2 h-4 w-4" />
                                Use Current Location
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            const willShow = !showMapSelector;
                            setShowMapSelector(willShow);
                            if (willShow) {
                                setAddressInput('');
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }
                        }}
                        className="flex-1 h-11"
                    >
                        <Map className="mr-2 h-4 w-4" />
                        {showMapSelector ? 'Hide Map' : 'Select on Map'}
                        {showMapSelector ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Map Selector */}
                {showMapSelector && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <LocationSelectorMap
                            center={mapCenter}
                            zoom={13}
                            onLocationSelect={handleMapLocationSelect}
                        />
                    </div>
                )}

                {/* Google Places Autocomplete (Suggestions API) - hidden when map is open */}
                {!showMapSelector && <div className="space-y-2 relative">
                    <IconInput
                        ref={inputRef}
                        type="text"
                        placeholder="Start typing your address..."
                        value={addressInput}
                        onChange={handleAddressInputChange}
                        disabled={!isGoogleMapsLoaded}
                        leftIcon={<MapPin className="w-5 h-5" />}
                        rightAction={
                            isLoadingSuggestions ? (
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : null
                        }
                        inputClassName="h-12"
                    />

                    {/* Character countdown feedback */}
                    {addressInput.length > 0 && addressInput.length < 5 && (
                        <p className="text-xs text-muted-foreground">
                            Type {5 - addressInput.length} more character{5 - addressInput.length !== 1 ? 's' : ''} to see suggestions...
                        </p>
                    )}

                    {/* Loading state */}
                    {!isGoogleMapsLoaded && (
                        <p className="text-xs text-muted-foreground">
                            Loading address search...
                        </p>
                    )}

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                            {suggestions.map((suggestion, index) => {
                                const prediction = suggestion.placePrediction;
                                if (!prediction) return null;

                                const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text || '';
                                const secondaryText = prediction.structuredFormat?.secondaryText?.text || '';

                                return (
                                    <button
                                        key={prediction.placeId || index}
                                        type="button"
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                        className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 focus:outline-none focus:bg-accent"
                                    >
                                        <div className="font-medium text-foreground">{mainText}</div>
                                        {secondaryText && (
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {secondaryText}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>}
                {location && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <MapPin className="w-4 h-4" />
                        <span>Location confirmed: {location.address || location.postcode}</span>
                    </div>
                )}
            </div>
            )}

            {/* Full Address Fields */}
            {showAddressFields && location && (
                <div className="space-y-4 p-4 bg-accent/30 rounded-xl border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <Home className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-semibold text-foreground">Confirm Your Address</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Please verify your address details are correct.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="address-line1">
                                Address Line 1 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="address-line1"
                                type="text"
                                placeholder="House/flat number and street name"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                e.g., 123 Main Street or Flat 4, Building Name
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="address-line2">Address Line 2</Label>
                            <Input
                                id="address-line2"
                                type="text"
                                placeholder="Building name, floor, etc. (optional)"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="town-city">
                                Town/City <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="town-city"
                                type="text"
                                placeholder="e.g., London"
                                value={townCity}
                                onChange={(e) => setTownCity(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="postcode-display">Postcode</Label>
                            <Input
                                id="postcode-display"
                                type="text"
                                value={location.postcode}
                                disabled
                                className="mt-1 bg-muted"
                            />
                        </div>
                    </div>

                    {/* Save Address Checkbox - Only for authenticated users in new address mode */}
                    {isAuthenticated && addressMode === 'new' && (
                        <div className="flex items-start gap-3 pt-4 border-t border-border mt-4">
                            <Checkbox
                                id="save-address"
                                checked={saveAddress}
                                onCheckedChange={(checked) => setSaveAddress(checked === true)}
                            />
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="save-address" className="text-sm font-medium cursor-pointer">
                                    Save this address for future bookings
                                </Label>
                                {saveAddress && (
                                    <Input
                                        type="text"
                                        placeholder="e.g., Home, Work, Mum's House"
                                        value={addressLabel}
                                        onChange={(e) => setAddressLabel(e.target.value)}
                                        className="mt-2"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

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

            {/* No Providers Error */}
            {noProvidersError && (
                <AutoDismissAlert
                    title="No providers found"
                    message={noProvidersError}
                    onDismiss={() => setNoProvidersError(null)}
                />
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    onClick={handleContinue}
                    disabled={
                        !location ||
                        !selectedDate ||
                        isCheckingProviders ||
                        isSavingAddress ||
                        !addressLine1.trim() ||
                        !townCity.trim()
                    }
                    className="flex-1 py-6 text-base"
                    size="lg"
                >
                    {isCheckingProviders || isSavingAddress ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isSavingAddress ? 'Saving address...' : 'Checking availability...'}
                        </>
                    ) : (
                        'Find Providers'
                    )}
                </Button>
            </div>
        </div>
    );
}
