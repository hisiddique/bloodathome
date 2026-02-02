import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Settings } from 'lucide-react';
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

interface MapboxMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: MapMarker[];
    onMarkerClick?: (marker: MapMarker) => void;
    selectedMarkerId?: string;
    showUserLocation?: boolean;
    radiusKm?: number;
    className?: string;
    mapboxToken?: string;
}

function createMarkerElement(
    markerData: MapMarker,
    isSelected: boolean
): HTMLElement {
    const container = document.createElement('div');
    container.className = `mapbox-marker relative flex items-center justify-center transition-all cursor-pointer ${
        isSelected ? 'scale-125' : 'scale-100'
    }`;

    let svgContent = '';
    let bgColor = '';
    let borderColor = '';

    switch (markerData.type) {
        case 'phlebotomist':
            bgColor = isSelected ? 'bg-teal-600' : 'bg-teal-500';
            borderColor = 'border-teal-700';
            svgContent = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 2 4 4"/>
                    <path d="m17 7 3-3"/>
                    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                    <path d="m9 11 4 4"/>
                    <path d="m5 19-3 3"/>
                    <path d="m14 4 6 6"/>
                </svg>
            `;
            break;

        case 'clinic':
            bgColor = isSelected ? 'bg-blue-600' : 'bg-blue-500';
            borderColor = 'border-blue-700';
            svgContent = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                    <path d="M9 22v-4h6v4"/>
                    <path d="M8 6h.01"/>
                    <path d="M16 6h.01"/>
                    <path d="M12 6h.01"/>
                    <path d="M12 10h.01"/>
                    <path d="M12 14h.01"/>
                    <path d="M16 10h.01"/>
                    <path d="M16 14h.01"/>
                    <path d="M8 10h.01"/>
                    <path d="M8 14h.01"/>
                </svg>
            `;
            break;

        case 'user':
            bgColor = 'bg-red-500';
            borderColor = 'border-red-700';
            svgContent = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            `;
            break;
    }

    container.innerHTML = `
        <div class="relative">
            <div class="${bgColor} ${borderColor} border-2 rounded-full p-1 shadow-lg ${isSelected ? 'shadow-xl' : ''}">
                ${svgContent}
            </div>
            ${
                markerData.showImage && markerData.imageUrl
                    ? `
                <div class="absolute inset-0 flex items-center justify-center">
                    <img
                        src="${markerData.imageUrl}"
                        alt="Provider"
                        class="w-6 h-6 rounded-full border-2 border-white shadow-md object-cover"
                    />
                </div>
            `
                    : ''
            }
        </div>
    `;

    return container;
}

export function MapboxMap({
    center,
    zoom = 13,
    markers = [],
    onMarkerClick,
    selectedMarkerId,
    radiusKm,
    className,
    mapboxToken,
}: MapboxMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const circleSourceId = 'radius-circle';
    const [mapError, setMapError] = useState(false);

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

            popupRef.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 25,
            });

            setMapError(false);
        } catch (error) {
            console.error('Error initializing Mapbox:', error);
            setMapError(true);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapboxToken]);

    // Update center and zoom
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setCenter([center.lng, center.lat]);
            mapRef.current.setZoom(zoom);
        }
    }, [center, zoom]);

    // Update radius circle
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        // Wait for map to load
        if (!map.isStyleLoaded()) {
            map.once('load', () => {
                updateCircle();
            });
        } else {
            updateCircle();
        }

        function updateCircle() {
            if (!map || !mapRef.current) return;

            // Remove existing circle
            if (map.getLayer(circleSourceId)) {
                map.removeLayer(circleSourceId);
            }
            if (map.getSource(circleSourceId)) {
                map.removeSource(circleSourceId);
            }

            if (!radiusKm) return;

            // Create circle GeoJSON
            const circleGeoJSON = createCircleGeoJSON(
                center.lng,
                center.lat,
                radiusKm
            );

            map.addSource(circleSourceId, {
                type: 'geojson',
                data: circleGeoJSON,
            });

            map.addLayer({
                id: circleSourceId,
                type: 'fill',
                source: circleSourceId,
                paint: {
                    'fill-color': '#3b82f6',
                    'fill-opacity': 0.15,
                },
            });

            map.addLayer({
                id: `${circleSourceId}-outline`,
                type: 'line',
                source: circleSourceId,
                paint: {
                    'line-color': '#3b82f6',
                    'line-width': 2,
                    'line-opacity': 0.8,
                },
            });
        }
    }, [center, radiusKm]);

    // Update markers
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Create new markers
        markers.forEach((markerData) => {
            try {
                const isSelected = markerData.id === selectedMarkerId;
                const element = createMarkerElement(markerData, isSelected);

                const marker = new mapboxgl.Marker({ element })
                    .setLngLat([markerData.position.lng, markerData.position.lat])
                    .addTo(mapRef.current!);

                // Add click listener
                if (onMarkerClick) {
                    element.addEventListener('click', () => {
                        onMarkerClick(markerData);
                    });
                }

                // Add hover listeners for popup
                if (
                    markerData.title ||
                    markerData.price !== undefined ||
                    markerData.rating !== undefined
                ) {
                    element.addEventListener('mouseenter', () => {
                        if (!popupRef.current || !mapRef.current) return;

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

                        popupRef.current
                            .setLngLat([
                                markerData.position.lng,
                                markerData.position.lat,
                            ])
                            .setHTML(content)
                            .addTo(mapRef.current!);
                    });

                    element.addEventListener('mouseleave', () => {
                        if (popupRef.current) {
                            popupRef.current.remove();
                        }
                    });
                }

                markersRef.current.push(marker);
            } catch (error) {
                console.error('Error creating marker:', error);
            }
        });
    }, [markers, onMarkerClick, selectedMarkerId]);

    // Cleanup
    useEffect(() => {
        return () => {
            markersRef.current.forEach((marker) => marker.remove());
        };
    }, []);

    if (mapError || !mapboxToken) {
        return (
            <div
                className={cn(
                    'relative w-full h-64 md:h-96 bg-muted rounded-2xl flex flex-col items-center justify-center p-6',
                    className
                )}
            >
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-gradient-to-br from-muted to-border rounded-2xl" />
                </div>
                <div className="relative z-10 text-center space-y-2">
                    <Settings className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                        {!mapboxToken
                            ? 'Mapbox access token not configured'
                            : 'Map unavailable - Please check configuration'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative w-full h-64 md:h-96 rounded-2xl overflow-hidden border border-border',
                className
            )}
        >
            <div ref={mapContainerRef} className="absolute inset-0" />
        </div>
    );
}

// Helper function to create circle GeoJSON
function createCircleGeoJSON(
    lng: number,
    lat: number,
    radiusKm: number
): GeoJSON.Feature<GeoJSON.Polygon> {
    const points = 64;
    const coords: [number, number][] = [];
    const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coords.push([lng + x, lat + y]);
    }

    coords.push(coords[0]); // Close the ring

    return {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Polygon',
            coordinates: [coords],
        },
    };
}

export default MapboxMap;
