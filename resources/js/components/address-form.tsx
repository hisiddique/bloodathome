import { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { MapPin, Navigation, Map, Loader2, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconInput } from '@/components/ui/icon-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { LocationSelectorMap } from '@/components/ui/location-selector-map';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Form } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface AddressData {
    label: string;
    address_line1: string;
    address_line2?: string;
    town_city: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
}

interface AddressFormProps {
    initialData?: AddressData;
    action: string;
    method: 'post' | 'put' | 'patch';
    onCancel: () => void;
}

export function AddressForm({ initialData, action, method, onCancel }: AddressFormProps) {
    const { googleMapsKey } = usePage<PageProps>().props;
    const { isLoaded: isGoogleMapsLoaded, libraries } = useGoogleMaps(googleMapsKey);

    const [showMapSelector, setShowMapSelector] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationNotSupported, setLocationNotSupported] = useState(false);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
        initialData?.latitude && initialData?.longitude
            ? { lat: initialData.latitude, lng: initialData.longitude }
            : { lat: 51.5074, lng: -0.1278 } // Default to London
    );

    // Address fields
    const [label, setLabel] = useState(initialData?.label || '');
    const [addressLine1, setAddressLine1] = useState(initialData?.address_line1 || '');
    const [addressLine2, setAddressLine2] = useState(initialData?.address_line2 || '');
    const [townCity, setTownCity] = useState(initialData?.town_city || '');
    const [postcode, setPostcode] = useState(initialData?.postcode || '');
    const [latitude, setLatitude] = useState<number | undefined>(initialData?.latitude);
    const [longitude, setLongitude] = useState<number | undefined>(initialData?.longitude);
    const [isDefault, setIsDefault] = useState(initialData?.is_default || false);
    const [showAddressFields, setShowAddressFields] = useState(!!initialData?.postcode);

    // Google Places Autocomplete
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

    // Helper to populate address from Google Place
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
        let postcodeValue = '';

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
                postcodeValue = component.longText || '';
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
        setPostcode(postcodeValue);
        setLatitude(lat);
        setLongitude(lng);
        setMapCenter({ lat, lng });
        setLocationNotSupported(false);
        setShowAddressFields(true);

        toast.success('Address found');
    };

    // Reverse geocode using Google Maps Geocoding API
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
                await reverseGeocodeWithPostcodeAPI(lat, lng);
                return !locationNotSupported;
            }
        } catch (error) {
            console.error('Google reverse geocoding error:', error);
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
                setPostcode(result.postcode);
                setLatitude(result.latitude);
                setLongitude(result.longitude);
                setMapCenter({ lat: result.latitude, lng: result.longitude });
                setLocationNotSupported(false);
                setShowAddressFields(true);
            } else {
                setLocationNotSupported(true);
            }
        } catch (error) {
            console.error('Postcode API error:', error);
            setLocationNotSupported(true);
        }
    };

    // Initialize session token
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

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (value.length < 5) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

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
            const place = suggestion.placePrediction.toPlace();

            await place.fetchFields({
                fields: ['addressComponents', 'location', 'formattedAddress']
            });

            if (!place.location) {
                toast.error('No location details available for this address');
                return;
            }

            await populateAddressFromPlace(place);

            const mainText = suggestion.placePrediction.structuredFormat?.mainText?.text || suggestion.placePrediction.text?.text || '';
            setAddressInput(mainText);

            setShowSuggestions(false);
            setSuggestions([]);

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

                    if (isGoogleMapsLoaded && libraries) {
                        isSupported = await reverseGeocodeWithGoogle(lat, lng);
                    } else {
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
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 60000,
            }
        );
    };

    const handleMapLocationSelect = async (coords: { lat: number; lng: number }) => {
        try {
            let isSupported = false;

            if (isGoogleMapsLoaded && libraries) {
                isSupported = await reverseGeocodeWithGoogle(coords.lat, coords.lng);
            } else {
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

    return (
        <Form action={action} method={method} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    {/* Label Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="label">
                            Label <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="label"
                            name="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g., Home, Work, Mum's House"
                            required
                        />
                        {errors.label && (
                            <p className="text-sm text-destructive">{errors.label}</p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                            Search for Address
                        </label>
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

                        {/* Google Places Autocomplete */}
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

                            {addressInput.length > 0 && addressInput.length < 5 && (
                                <p className="text-xs text-muted-foreground">
                                    Type {5 - addressInput.length} more character{5 - addressInput.length !== 1 ? 's' : ''} to see suggestions...
                                </p>
                            )}

                            {!isGoogleMapsLoaded && (
                                <p className="text-xs text-muted-foreground">
                                    Loading address search...
                                </p>
                            )}

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

                        {postcode && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <MapPin className="w-4 h-4" />
                                <span>Location confirmed: {postcode}</span>
                            </div>
                        )}
                    </div>

                    {/* Full Address Fields */}
                    {showAddressFields && postcode && (
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
                                        name="address_line1"
                                        type="text"
                                        placeholder="House/flat number and street name"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.address_line1 && (
                                        <p className="text-sm text-destructive mt-1">{errors.address_line1}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        e.g., 123 Main Street or Flat 4, Building Name
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="address-line2">Address Line 2</Label>
                                    <Input
                                        id="address-line2"
                                        name="address_line2"
                                        type="text"
                                        placeholder="Building name, floor, etc. (optional)"
                                        value={addressLine2}
                                        onChange={(e) => setAddressLine2(e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.address_line2 && (
                                        <p className="text-sm text-destructive mt-1">{errors.address_line2}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="town-city">
                                        Town/City <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="town-city"
                                        name="town_city"
                                        type="text"
                                        placeholder="e.g., London"
                                        value={townCity}
                                        onChange={(e) => setTownCity(e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.town_city && (
                                        <p className="text-sm text-destructive mt-1">{errors.town_city}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="postcode-display">Postcode <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="postcode-display"
                                        name="postcode"
                                        type="text"
                                        value={postcode}
                                        onChange={(e) => setPostcode(e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.postcode && (
                                        <p className="text-sm text-destructive mt-1">{errors.postcode}</p>
                                    )}
                                </div>

                                {/* Hidden lat/lng fields */}
                                <input type="hidden" name="latitude" value={latitude || ''} />
                                <input type="hidden" name="longitude" value={longitude || ''} />
                            </div>
                        </div>
                    )}

                    {/* Set as Default Checkbox */}
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="is-default"
                            checked={isDefault}
                            onCheckedChange={(checked) => setIsDefault(checked === true)}
                        />
                        <input type="hidden" name="is_default" value={isDefault ? '1' : '0'} />
                        <Label htmlFor="is-default" className="text-sm font-medium cursor-pointer">
                            Set as default address
                        </Label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={processing || !postcode || !addressLine1.trim() || !townCity.trim()}
                            className="flex-1"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Address'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
