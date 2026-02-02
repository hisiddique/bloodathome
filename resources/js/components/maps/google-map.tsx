import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { createProviderMarkerElement, getMarkerIcon } from './provider-marker';
import { cn } from '@/lib/utils';

export interface MapMarker {
    id: string;
    position: { lat: number; lng: number };
    type: 'phlebotomist' | 'clinic' | 'user';
    title?: string;
    price?: number;
    rating?: number;
    imageUrl?: string;
    showImage?: boolean;
}

interface GoogleMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: MapMarker[];
    onMarkerClick?: (marker: MapMarker) => void;
    selectedMarkerId?: string;
    showUserLocation?: boolean;
    radiusKm?: number;
    className?: string;
}

export function GoogleMap({
    center,
    zoom = 13,
    markers = [],
    onMarkerClick,
    selectedMarkerId,
    showUserLocation = false,
    radiusKm,
    className,
}: GoogleMapProps) {
    const { googleMapsKey } = usePage<{ googleMapsKey?: string }>().props;
    const { isLoaded, loadError, google } = useGoogleMaps(googleMapsKey);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const circleRef = useRef<google.maps.Circle | null>(null);
    const [mapError, setMapError] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!isLoaded || !google || !mapRef.current || mapInstanceRef.current) {
            return;
        }

        try {
            mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                center,
                zoom,
                mapId: 'BLOODATHOME_MAP',
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
            });

            infoWindowRef.current = new google.maps.InfoWindow();
            setMapError(false);
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError(true);
        }
    }, [isLoaded, google, center, zoom]);

    // Update center and zoom
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(center);
            mapInstanceRef.current.setZoom(zoom);
        }
    }, [center, zoom]);

    // Update radius circle
    useEffect(() => {
        if (!mapInstanceRef.current || !google || !radiusKm) {
            if (circleRef.current) {
                circleRef.current.setMap(null);
                circleRef.current = null;
            }
            return;
        }

        if (circleRef.current) {
            circleRef.current.setMap(null);
        }

        circleRef.current = new google.maps.Circle({
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            map: mapInstanceRef.current,
            center,
            radius: radiusKm * 1000, // Convert km to meters
        });
    }, [google, center, radiusKm]);

    // Update markers
    useEffect(() => {
        if (!mapInstanceRef.current || !google || !isLoaded) {
            return;
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => {
            marker.map = null;
        });
        markersRef.current = [];

        // Create new markers
        markers.forEach((markerData) => {
            try {
                const isSelected = markerData.id === selectedMarkerId;

                // Create marker element
                const markerElement = createProviderMarkerElement({
                    type: markerData.type,
                    imageUrl: markerData.imageUrl,
                    showImage: markerData.showImage,
                    isSelected,
                });

                // Create advanced marker
                const marker = new google.maps.marker.AdvancedMarkerElement({
                    map: mapInstanceRef.current,
                    position: markerData.position,
                    content: markerElement,
                    title: markerData.title,
                });

                // Add click listener
                if (onMarkerClick) {
                    marker.addListener('click', () => {
                        onMarkerClick(markerData);
                    });
                }

                // Add hover listener for info window
                if (
                    markerData.title ||
                    markerData.price !== undefined ||
                    markerData.rating !== undefined
                ) {
                    marker.addListener('mouseenter', () => {
                        if (!infoWindowRef.current) return;

                        let content = '<div class="p-2 font-sans">';

                        if (markerData.title) {
                            content += `<div class="font-semibold text-sm mb-1">${markerData.title}</div>`;
                        }

                        if (
                            markerData.price !== undefined ||
                            markerData.rating !== undefined
                        ) {
                            content += '<div class="flex gap-2 text-xs">';

                            if (markerData.price !== undefined) {
                                content += `<span class="text-green-600 font-medium">£${markerData.price}</span>`;
                            }

                            if (markerData.rating !== undefined) {
                                content += `<span class="text-amber-500">★ ${markerData.rating}</span>`;
                            }

                            content += '</div>';
                        }

                        content += '</div>';

                        infoWindowRef.current.setContent(content);
                        infoWindowRef.current.open(
                            mapInstanceRef.current,
                            marker,
                        );
                    });

                    marker.addListener('mouseleave', () => {
                        if (infoWindowRef.current) {
                            infoWindowRef.current.close();
                        }
                    });
                }

                markersRef.current.push(marker);
            } catch (error) {
                console.error('Error creating marker:', error);
            }
        });
    }, [
        google,
        isLoaded,
        markers,
        onMarkerClick,
        selectedMarkerId,
        showUserLocation,
    ]);

    // Cleanup
    useEffect(() => {
        return () => {
            markersRef.current.forEach((marker) => {
                marker.map = null;
            });
            if (circleRef.current) {
                circleRef.current.setMap(null);
            }
        };
    }, []);

    if (loadError || mapError || !googleMapsKey) {
        return (
            <div
                className={cn(
                    'relative w-full h-64 md:h-96 bg-muted rounded-2xl flex flex-col items-center justify-center p-6',
                    className,
                )}
            >
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-gradient-to-br from-muted to-border rounded-2xl" />
                </div>
                <div className="relative z-10 text-center space-y-2">
                    <Settings className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                        {!googleMapsKey
                            ? 'Google Maps API key not configured'
                            : 'Map unavailable - Please check configuration'}
                    </p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                className={cn(
                    'relative w-full h-64 md:h-96 bg-muted rounded-2xl flex items-center justify-center',
                    className,
                )}
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">
                        Loading map...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative w-full h-64 md:h-96 rounded-2xl overflow-hidden border border-border',
                className,
            )}
        >
            <div ref={mapRef} className="absolute inset-0" />
        </div>
    );
}

export default GoogleMap;
