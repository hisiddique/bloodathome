import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PlaceResult {
    postcode: string;
    lat: number;
    lng: number;
    formattedAddress: string;
}

interface LocationAutocompleteProps {
    onPlaceSelect: (place: PlaceResult) => void;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
}

export function LocationAutocomplete({
    onPlaceSelect,
    placeholder = 'Enter UK postcode or address...',
    defaultValue,
    className,
}: LocationAutocompleteProps) {
    const { googleMapsKey } = usePage<{ googleMapsKey?: string }>().props;
    const { isLoaded, loadError, google } = useGoogleMaps(googleMapsKey);
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(
        null,
    );
    const [isLocating, setIsLocating] = useState(false);
    const [inputValue, setInputValue] = useState(defaultValue || '');

    // Initialize autocomplete
    useEffect(() => {
        if (
            !isLoaded ||
            !google ||
            !inputRef.current ||
            autocompleteRef.current
        ) {
            return;
        }

        try {
            autocompleteRef.current = new google.maps.places.Autocomplete(
                inputRef.current,
                {
                    componentRestrictions: { country: 'gb' },
                    fields: [
                        'address_components',
                        'geometry',
                        'formatted_address',
                    ],
                    types: ['address', 'postal_code'],
                },
            );

            autocompleteRef.current.addListener('place_changed', () => {
                if (!autocompleteRef.current) return;

                const place = autocompleteRef.current.getPlace();

                if (!place.geometry?.location) {
                    console.error('No geometry found for place');
                    return;
                }

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                let postcode = '';

                // Extract postcode from address components
                if (place.address_components) {
                    for (const component of place.address_components) {
                        if (component.types.includes('postal_code')) {
                            postcode = component.long_name;
                            break;
                        }
                    }
                }

                // If no postcode found, try to extract from formatted address
                if (!postcode && place.formatted_address) {
                    const postcodeMatch =
                        place.formatted_address.match(
                            /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i,
                        );
                    if (postcodeMatch) {
                        postcode = postcodeMatch[0].toUpperCase();
                    }
                }

                onPlaceSelect({
                    postcode: postcode || 'N/A',
                    lat,
                    lng,
                    formattedAddress: place.formatted_address || '',
                });

                setInputValue(place.formatted_address || postcode);
            });
        } catch (error) {
            console.error('Error initializing autocomplete:', error);
        }
    }, [isLoaded, google, onPlaceSelect]);

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        if (!google) {
            alert('Google Maps not loaded yet');
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const geocoder = new google.maps.Geocoder();
                    const response = await geocoder.geocode({
                        location: { lat: latitude, lng: longitude },
                    });

                    if (response.results && response.results.length > 0) {
                        const result = response.results[0];
                        let postcode = '';

                        // Extract postcode
                        if (result.address_components) {
                            for (const component of result.address_components) {
                                if (component.types.includes('postal_code')) {
                                    postcode = component.long_name;
                                    break;
                                }
                            }
                        }

                        // Fallback to formatted address parsing
                        if (!postcode && result.formatted_address) {
                            const postcodeMatch =
                                result.formatted_address.match(
                                    /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i,
                                );
                            if (postcodeMatch) {
                                postcode = postcodeMatch[0].toUpperCase();
                            }
                        }

                        onPlaceSelect({
                            postcode: postcode || 'N/A',
                            lat: latitude,
                            lng: longitude,
                            formattedAddress: result.formatted_address || '',
                        });

                        setInputValue(result.formatted_address || postcode);
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error);
                    alert('Unable to get your address. Please enter manually.');
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setIsLocating(false);

                let message = 'Unable to get your location.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Location permission denied. Please enable it.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = 'Location information unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    message = 'Location request timed out.';
                }

                alert(message + ' Please enter your postcode manually.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    };

    if (loadError || !googleMapsKey) {
        return (
            <div
                className={cn(
                    'p-4 rounded-lg border border-border bg-muted text-center',
                    className,
                )}
            >
                <p className="text-sm text-muted-foreground">
                    {!googleMapsKey
                        ? 'Google Maps API key not configured'
                        : 'Unable to load location search'}
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                className={cn(
                    'relative flex items-center gap-2 p-4 rounded-2xl border border-border bg-card',
                    className,
                )}
            >
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">
                    Loading location search...
                </span>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholder}
                    className="pl-12 pr-12 py-6 rounded-2xl border-border bg-card text-base"
                />
                <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                    className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg',
                        'text-muted-foreground hover:text-foreground hover:bg-muted',
                        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                    title="Use my location"
                >
                    {isLocating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Navigation className="w-5 h-5" />
                    )}
                </button>
            </div>

            <p className="text-xs text-muted-foreground">
                Start typing your UK postcode or address
            </p>
        </div>
    );
}

export default LocationAutocomplete;
