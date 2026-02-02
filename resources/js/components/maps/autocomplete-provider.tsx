import { LocationAutocomplete } from './location-autocomplete';
import { MapboxAutocomplete } from './mapbox-autocomplete';
import type { PlaceResult } from './location-autocomplete';

interface AutocompleteProviderProps {
    provider: 'google' | 'mapbox';
    googleMapsKey?: string;
    mapboxToken?: string;
    onPlaceSelect: (place: PlaceResult) => void;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
}

export function AutocompleteProvider({
    provider,
    googleMapsKey,
    mapboxToken,
    ...autocompleteProps
}: AutocompleteProviderProps) {
    if (provider === 'mapbox' && mapboxToken) {
        return (
            <MapboxAutocomplete
                {...autocompleteProps}
                mapboxToken={mapboxToken}
            />
        );
    }

    return <LocationAutocomplete {...autocompleteProps} />;
}

export default AutocompleteProvider;
