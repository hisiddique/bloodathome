import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

interface LocationSelectorMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    onLocationSelect: (location: { lat: number; lng: number }) => void;
    className?: string;
}

export function LocationSelectorMap({
    center,
    zoom = 13,
    onLocationSelect,
    className,
}: LocationSelectorMapProps) {
    const { mapProvider, googleMapsKey, mapboxToken } = usePage<PageProps>().props;

    if (mapProvider === 'google') {
        return (
            <GoogleLocationSelector
                center={center}
                zoom={zoom}
                onLocationSelect={onLocationSelect}
                googleMapsKey={googleMapsKey}
                className={className}
            />
        );
    }

    return (
        <MapboxLocationSelector
            center={center}
            zoom={zoom}
            onLocationSelect={onLocationSelect}
            mapboxToken={mapboxToken}
            className={className}
        />
    );
}

// Google Maps Implementation
function GoogleLocationSelector({
    center,
    zoom,
    onLocationSelect,
    googleMapsKey,
    className,
}: LocationSelectorMapProps & { googleMapsKey?: string }) {
    const { isLoaded, loadError, libraries } = useGoogleMaps(googleMapsKey);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [mapError, setMapError] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!isLoaded || !libraries || !mapRef.current || mapInstanceRef.current) {
            return;
        }

        try {
            const { Map, AdvancedMarkerElement } = libraries;

            mapInstanceRef.current = new Map(mapRef.current, {
                center,
                zoom,
                mapId: 'BLOODATHOME_LOCATION_SELECTOR',
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                draggableCursor: 'crosshair',
            });

            // Create initial marker
            const markerElement = document.createElement('div');
            markerElement.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="bg-red-500 border-2 border-red-700 rounded-full p-2 shadow-lg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-700 -mt-1"></div>
                </div>
            `;

            markerRef.current = new AdvancedMarkerElement({
                map: mapInstanceRef.current,
                position: center,
                content: markerElement,
                title: 'Selected Location',
            });

            // Add click listener to map
            mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (e.latLng && markerRef.current) {
                    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    markerRef.current.position = newPosition;
                    onLocationSelect(newPosition);
                }
            });

            setMapError(false);
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError(true);
        }
    }, [isLoaded, libraries, center, zoom, onLocationSelect]);

    // Update marker position when center changes
    useEffect(() => {
        if (markerRef.current && mapInstanceRef.current) {
            markerRef.current.position = center;
            mapInstanceRef.current.setCenter(center);
        }
    }, [center]);

    if (loadError || mapError || !googleMapsKey) {
        return (
            <div className={cn('relative w-full h-96 bg-muted rounded-2xl flex flex-col items-center justify-center p-6', className)}>
                <MapPin className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    {!googleMapsKey ? 'Google Maps API key not configured' : loadError?.message || 'Map unavailable'}
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={cn('relative w-full h-96 bg-muted rounded-2xl flex items-center justify-center', className)}>
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('relative w-full h-96 rounded-2xl overflow-hidden border border-border', className)}>
            <div ref={mapRef} className="absolute inset-0" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-lg z-10">
                <p className="text-sm text-gray-700 dark:text-gray-200 text-center">Click on the map to select a location</p>
            </div>
        </div>
    );
}

// Mapbox Implementation
function MapboxLocationSelector({
    center,
    zoom,
    onLocationSelect,
    mapboxToken,
    className,
}: LocationSelectorMapProps & { mapboxToken?: string }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const [mapError, setMapError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize map
    useEffect(() => {
        if (!mapboxToken || !mapContainerRef.current || mapRef.current) {
            return;
        }

        try {
            mapboxgl.accessToken = mapboxToken;

            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [center.lng, center.lat],
                zoom,
            });

            mapRef.current.addControl(new mapboxgl.NavigationControl());

            // Create marker element
            const markerElement = document.createElement('div');
            markerElement.innerHTML = `
                <div class="flex flex-col items-center">
                    <div class="bg-red-500 border-2 border-red-700 rounded-full p-2 shadow-lg">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-700 -mt-1"></div>
                </div>
            `;

            markerRef.current = new mapboxgl.Marker({ element: markerElement, draggable: false })
                .setLngLat([center.lng, center.lat])
                .addTo(mapRef.current);

            // Add click listener to map
            mapRef.current.on('click', (e) => {
                if (markerRef.current) {
                    const newPosition = { lat: e.lngLat.lat, lng: e.lngLat.lng };
                    markerRef.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
                    onLocationSelect(newPosition);
                }
            });

            mapRef.current.on('load', () => {
                setIsLoading(false);
                if (mapRef.current) {
                    mapRef.current.getCanvas().style.cursor = 'crosshair';
                }
            });

            setMapError(false);
        } catch (error) {
            console.error('Error initializing Mapbox:', error);
            setMapError(true);
            setIsLoading(false);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapboxToken, center.lat, center.lng, zoom, onLocationSelect]);

    // Update marker position when center changes
    useEffect(() => {
        if (markerRef.current && mapRef.current) {
            markerRef.current.setLngLat([center.lng, center.lat]);
            mapRef.current.setCenter([center.lng, center.lat]);
        }
    }, [center]);

    if (mapError || !mapboxToken) {
        return (
            <div className={cn('relative w-full h-96 bg-muted rounded-2xl flex flex-col items-center justify-center p-6', className)}>
                <MapPin className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    {!mapboxToken ? 'Mapbox access token not configured' : 'Map unavailable'}
                </p>
            </div>
        );
    }

    return (
        <div className={cn('relative w-full h-96 rounded-2xl overflow-hidden border border-border', className)}>
            <div ref={mapContainerRef} className="absolute inset-0" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-lg z-10">
                <p className="text-sm text-gray-700 dark:text-gray-200 text-center">Click on the map to select a location</p>
            </div>
        </div>
    );
}
