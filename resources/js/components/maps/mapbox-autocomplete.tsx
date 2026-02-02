import { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface PlaceResult {
    postcode: string;
    lat: number;
    lng: number;
    formattedAddress: string;
}

interface MapboxAutocompleteProps {
    onPlaceSelect: (place: PlaceResult) => void;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
    mapboxToken?: string;
}

interface MapboxSuggestion {
    id: string;
    place_name: string;
    center: [number, number];
    context?: Array<{ id: string; text: string }>;
}

export function MapboxAutocomplete({
    onPlaceSelect,
    placeholder = 'Enter UK postcode or address...',
    defaultValue,
    className,
    mapboxToken,
}: MapboxAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue || '');
    const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch suggestions from Mapbox Geocoding API
    const fetchSuggestions = async (query: string) => {
        if (!mapboxToken || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                    new URLSearchParams({
                        access_token: mapboxToken,
                        country: 'GB',
                        types: 'address,postcode,place',
                        limit: '5',
                    })
            );

            const data = await response.json();

            if (data.features && Array.isArray(data.features)) {
                setSuggestions(data.features);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input change with debouncing
    const handleInputChange = (value: string) => {
        setInputValue(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    // Extract postcode from Mapbox context
    const extractPostcode = (suggestion: MapboxSuggestion): string => {
        // Check if place_name contains a UK postcode pattern
        const postcodeMatch = suggestion.place_name.match(
            /[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/i
        );
        if (postcodeMatch) {
            return postcodeMatch[0].toUpperCase();
        }

        // Check context for postcode
        if (suggestion.context) {
            for (const ctx of suggestion.context) {
                if (ctx.id.startsWith('postcode')) {
                    return ctx.text.toUpperCase();
                }
            }
        }

        return 'N/A';
    };

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion: MapboxSuggestion) => {
        const [lng, lat] = suggestion.center;
        const postcode = extractPostcode(suggestion);

        onPlaceSelect({
            postcode,
            lat,
            lng,
            formattedAddress: suggestion.place_name,
        });

        setInputValue(suggestion.place_name);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Handle geolocation
    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        if (!mapboxToken) {
            alert('Mapbox not configured');
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse geocoding
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
                            new URLSearchParams({
                                access_token: mapboxToken,
                                types: 'address,postcode,place',
                                limit: '1',
                            })
                    );

                    const data = await response.json();

                    if (data.features && data.features.length > 0) {
                        const result = data.features[0];
                        const postcode = extractPostcode(result);

                        onPlaceSelect({
                            postcode,
                            lat: latitude,
                            lng: longitude,
                            formattedAddress: result.place_name,
                        });

                        setInputValue(result.place_name);
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
            }
        );
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    if (!mapboxToken) {
        return (
            <div
                className={cn(
                    'p-4 rounded-lg border border-border bg-muted text-center',
                    className
                )}
            >
                <p className="text-sm text-muted-foreground">
                    Mapbox access token not configured
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)} ref={inputRef}>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-12 pr-12 py-6 rounded-2xl border-border bg-card text-base"
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                    className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg',
                        'text-muted-foreground hover:text-foreground hover:bg-muted',
                        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-2"
                        >
                            <MapPin className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-foreground truncate">
                                    {suggestion.place_name}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Searching...</span>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Start typing your UK postcode or address
            </p>
        </div>
    );
}

export default MapboxAutocomplete;
