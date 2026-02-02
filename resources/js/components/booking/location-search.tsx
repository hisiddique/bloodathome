import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { MapPin, Search } from 'lucide-react';
import { LocationMap } from './location-map';
import { LazyAutocompleteProvider } from '@/components/maps/lazy-map-provider';
import type { PlaceResult } from '@/components/maps/location-autocomplete';
import { ConfirmButton } from './confirm-button';

interface LocationSearchProps {
    onLocationSelect: (
        postcode: string,
        coordinates?: [number, number],
    ) => void;
    onBack: () => void;
    collectionTypeLabel: string;
}

export function LocationSearch({
    onLocationSelect,
    onBack,
    collectionTypeLabel,
}: LocationSearchProps) {
    const { mapProvider, googleMapsKey, mapboxToken } = usePage<{
        mapProvider: 'google' | 'mapbox';
        googleMapsKey?: string;
        mapboxToken?: string;
    }>().props;
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(
        null,
    );
    const [coordinates, setCoordinates] = useState<[number, number]>([
        -0.1276, 51.5074,
    ]); // Default London

    const handlePlaceSelect = (place: PlaceResult) => {
        setSelectedPlace(place);
        setCoordinates([place.lng, place.lat]);
    };

    const handleSearch = () => {
        if (selectedPlace) {
            onLocationSelect(selectedPlace.postcode, coordinates);
        }
    };

    const isValidLocation = selectedPlace !== null;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Back to collection types
            </button>

            {/* Selected Service */}
            <div className="p-4 rounded-xl border border-primary bg-primary/5">
                <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    <div>
                        <h3 className="font-semibold text-foreground">
                            {collectionTypeLabel}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Enter your postcode to find nearby phlebotomists
                        </p>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-border">
                <LocationMap
                    center={coordinates}
                    zoom={13}
                    markers={
                        selectedPlace
                            ? [
                                  {
                                      id: 'user',
                                      coordinates,
                                      label: selectedPlace.postcode,
                                  },
                              ]
                            : []
                    }
                />
            </div>

            {/* Location Autocomplete */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                    Enter your postcode or address
                </label>
                <LazyAutocompleteProvider
                    provider={mapProvider}
                    googleMapsKey={googleMapsKey}
                    mapboxToken={mapboxToken}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="e.g., SW1A 1AA"
                />
            </div>

            {/* Selected Location Display */}
            {selectedPlace && (
                <div className="p-3 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                        Selected location:
                    </p>
                    <p className="font-medium text-foreground">
                        {selectedPlace.formattedAddress}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Postcode: {selectedPlace.postcode}
                    </p>
                </div>
            )}

            {/* Search Button */}
            <ConfirmButton onClick={handleSearch} disabled={!isValidLocation}>
                <span className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    Find Nearby Phlebotomists
                </span>
            </ConfirmButton>
        </div>
    );
}

export default LocationSearch;
