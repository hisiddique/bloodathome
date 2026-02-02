import { usePage } from '@inertiajs/react';
import { LazyMapProvider } from '@/components/maps/lazy-map-provider';
import type { MapMarker } from '@/components/maps/google-map';

interface LocationMapProps {
    center: [number, number];
    zoom?: number;
    markers?: Array<{
        id: string;
        coordinates: [number, number];
        label?: string;
    }>;
}

export function LocationMap({
    center,
    zoom = 12,
    markers = [],
}: LocationMapProps) {
    const { mapProvider, googleMapsKey, mapboxToken } = usePage<{
        mapProvider: 'google' | 'mapbox';
        googleMapsKey?: string;
        mapboxToken?: string;
    }>().props;

    // Convert markers to new format
    const mapMarkers: MapMarker[] = markers.map((marker) => ({
        id: marker.id,
        position: { lat: center[1], lng: center[0] },
        type: 'user',
        title: marker.label,
    }));

    return (
        <LazyMapProvider
            provider={mapProvider}
            googleMapsKey={googleMapsKey}
            mapboxToken={mapboxToken}
            center={{ lat: center[1], lng: center[0] }}
            zoom={zoom}
            markers={mapMarkers}
        />
    );
}

export default LocationMap;
