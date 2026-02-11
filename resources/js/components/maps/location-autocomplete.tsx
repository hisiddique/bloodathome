import { useState, useRef, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { IconInput } from '@/components/ui/icon-input';
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
    const { isLoaded, loadError } = useGoogleMaps(googleMapsKey);

    const [inputValue, setInputValue] = useState(defaultValue || '');
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Initialize session token
    useEffect(() => {
        if (isLoaded && !sessionToken) {
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
    }, [isLoaded, sessionToken]);

    // Fetch autocomplete suggestions
    const fetchSuggestions = useCallback(async (input: string) => {
        if (!isLoaded || !sessionToken || input.length < 5) {
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
    }, [isLoaded, sessionToken]);

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

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
            console.error('Invalid suggestion');
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
                console.error('No location found for place');
                return;
            }

            const lat = place.location.lat();
            const lng = place.location.lng();
            let postcode = '';

            // Extract postcode from address components
            if (place.addressComponents) {
                for (const component of place.addressComponents) {
                    if (component.types.includes('postal_code')) {
                        postcode = component.longText || '';
                        break;
                    }
                }
            }

            // If no postcode found, try to extract from formatted address
            if (!postcode && place.formattedAddress) {
                const postcodeMatch = place.formattedAddress.match(
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
                formattedAddress: place.formattedAddress || '',
            });

            // Update input value
            const mainText = suggestion.placePrediction.structuredFormat?.mainText?.text || suggestion.placePrediction.text?.text || '';
            setInputValue(mainText);

            // Hide suggestions
            setShowSuggestions(false);
            setSuggestions([]);

            // Create new session token
            const { AutocompleteSessionToken } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
            setSessionToken(new AutocompleteSessionToken());
        } catch (error) {
            console.error('Error selecting suggestion:', error);
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

    // Handle use current location
    const handleUseLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        if (!isLoaded) {
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
        <div className={cn('space-y-3 relative', className)}>
            <IconInput
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                disabled={!isLoaded}
                leftIcon={<MapPin className="w-5 h-5" />}
                rightAction={
                    isLoadingSuggestions ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                        <button
                            type="button"
                            onClick={handleUseLocation}
                            disabled={isLocating}
                            className={cn(
                                'p-2 rounded-lg',
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
                    )
                }
            />

            {/* Character countdown feedback */}
            {inputValue.length > 0 && inputValue.length < 5 && (
                <p className="text-xs text-muted-foreground">
                    Type {5 - inputValue.length} more character{5 - inputValue.length !== 1 ? 's' : ''} to see suggestions...
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
        </div>
    );
}

export default LocationAutocomplete;
