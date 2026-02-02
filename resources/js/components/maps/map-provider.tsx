import { GoogleMap } from './google-map';
import { MapboxMap } from './mapbox-map';
import type { MapMarker } from './google-map';

interface MapProviderProps {
    provider: 'google' | 'mapbox';
    googleMapsKey?: string;
    mapboxToken?: string;
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: MapMarker[];
    onMarkerClick?: (marker: MapMarker) => void;
    selectedMarkerId?: string;
    showUserLocation?: boolean;
    radiusKm?: number;
    className?: string;
}

export function MapProvider({
    provider,
    googleMapsKey,
    mapboxToken,
    ...mapProps
}: MapProviderProps) {
    if (provider === 'mapbox' && mapboxToken) {
        return <MapboxMap {...mapProps} mapboxToken={mapboxToken} />;
    }

    return <GoogleMap {...mapProps} />;
}

export default MapProvider;
