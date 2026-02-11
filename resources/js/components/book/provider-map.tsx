import { useEffect, useRef, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageProps, Provider } from '@/types';
import { clusterItems, spiderfyPositions, getClusterDistance, type Cluster } from '@/lib/map-clustering';

interface ProviderMapProps {
    providers: Provider[];
    userLocation: { lat: number; lng: number };
    selectedProvider: Provider | null;
    onProviderClick: (provider: Provider) => void;
    className?: string;
}

export function ProviderMap({
    providers,
    userLocation,
    selectedProvider,
    onProviderClick,
    className,
}: ProviderMapProps) {
    const { mapProvider, googleMapsKey, mapboxToken } = usePage<PageProps>().props;

    if (mapProvider === 'google') {
        return (
            <GoogleProviderMap
                providers={providers}
                userLocation={userLocation}
                selectedProvider={selectedProvider}
                onProviderClick={onProviderClick}
                googleMapsKey={googleMapsKey}
                className={className}
            />
        );
    }

    return (
        <MapboxProviderMap
            providers={providers}
            userLocation={userLocation}
            selectedProvider={selectedProvider}
            onProviderClick={onProviderClick}
            mapboxToken={mapboxToken}
            className={className}
        />
    );
}

// Google Maps Implementation
function GoogleProviderMap({
    providers,
    userLocation,
    selectedProvider,
    onProviderClick,
    googleMapsKey,
    className,
}: ProviderMapProps & { googleMapsKey?: string }) {
    const { isLoaded, loadError, libraries } = useGoogleMaps(googleMapsKey);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const providerMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const [mapError, setMapError] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(12);
    const currentZoomRef = useRef(12);
    const [isSpiderfied, setIsSpiderfied] = useState<string | null>(null); // cluster id that's spiderfied
    const spiderfyMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
    const spiderfyLinesRef = useRef<google.maps.Polyline[]>([]);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize map
    useEffect(() => {
        if (!isLoaded || !libraries || !mapRef.current || mapInstanceRef.current) {
            return;
        }

        try {
            const { Map, AdvancedMarkerElement } = libraries;

            mapInstanceRef.current = new Map(mapRef.current, {
                center: userLocation,
                zoom: 12,
                mapId: 'BLOODATHOME_PROVIDER_MAP',
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
            });

            // Create user location marker (Google Maps-style blue dot with glow)
            const userMarkerElement = document.createElement('div');
            userMarkerElement.innerHTML = `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
                    <div class="absolute w-6 h-6 bg-blue-500/20 rounded-full"></div>
                    <div class="relative w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>
            `;

            userMarkerRef.current = new AdvancedMarkerElement({
                map: mapInstanceRef.current,
                position: userLocation,
                content: userMarkerElement,
                title: 'Your Location',
            });

            // Create info window (we'll hide the close button via CSS)
            infoWindowRef.current = new google.maps.InfoWindow({
                disableAutoPan: true,
            });

            // Add CSS to hide InfoWindow close button
            const style = document.createElement('style');
            style.textContent = `
                .gm-ui-hover-effect { display: none !important; }
                .gm-style-iw-chr { display: none !important; }
            `;
            document.head.appendChild(style);

            // Listen for zoom changes
            mapInstanceRef.current.addListener('zoom_changed', () => {
                const zoom = mapInstanceRef.current?.getZoom();
                if (zoom !== undefined) {
                    currentZoomRef.current = zoom;
                    setCurrentZoom(zoom);
                    clearSpiderfy(); // Reset spiderfy on zoom change
                }
            });

            // Listen for map clicks (to collapse spiderfy)
            mapInstanceRef.current.addListener('click', () => {
                clearSpiderfy();
            });

            // Signal that the map is fully initialized and ready for fitBounds
            google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
                setMapReady(true);
            });

            setMapError(false);
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError(true);
        }
    }, [isLoaded, libraries, userLocation]);

    // Helper to clear spiderfied state
    const clearSpiderfy = useCallback(() => {
        if (!isSpiderfied) return;

        // Remove spiderfy markers
        spiderfyMarkersRef.current.forEach((marker) => {
            marker.map = null;
        });
        spiderfyMarkersRef.current.clear();

        // Remove spiderfy lines
        spiderfyLinesRef.current.forEach((line) => {
            line.setMap(null);
        });
        spiderfyLinesRef.current = [];

        setIsSpiderfied(null);
    }, [isSpiderfied]);

    // Fit bounds when providers change (separate from marker rendering)
    useEffect(() => {
        if (!mapInstanceRef.current || !mapReady || providers.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(userLocation);

        // Include all valid providers so the map zooms to show user + all providers
        const validProviders = providers.filter((p) => p.latitude && p.longitude);
        validProviders.forEach((p) => {
            bounds.extend({ lat: p.latitude!, lng: p.longitude! });
        });

        mapInstanceRef.current.fitBounds(bounds, { padding: 60 });
    }, [providers, userLocation, mapReady]);

    // Update provider markers
    useEffect(() => {
        if (!mapInstanceRef.current || !libraries || !isLoaded) {
            return;
        }

        const { AdvancedMarkerElement } = libraries;

        // Clear existing markers
        providerMarkersRef.current.forEach((marker) => {
            marker.map = null;
        });
        providerMarkersRef.current.clear();

        // Inline spiderfy cleanup (avoid callback dependency)
        spiderfyMarkersRef.current.forEach((marker) => {
            marker.map = null;
        });
        spiderfyMarkersRef.current.clear();
        spiderfyLinesRef.current.forEach((line) => {
            line.setMap(null);
        });
        spiderfyLinesRef.current = [];
        setIsSpiderfied(null);

        // Helper function to get icon SVG based on provider type
        const getProviderIcon = (typeName: string | undefined, isSelected: boolean) => {
            if (isSelected) {
                // Checkmark for selected
                return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>`;
            }

            const type = typeName?.toLowerCase() || '';

            if (type === 'clinic') {
                // Hospital/clinic building with medical cross
                return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M12 8v8"/>
                    <path d="M8 12h8"/>
                </svg>`;
            }

            if (type === 'laboratory') {
                // Flask/test tube icon
                return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 3h6"/>
                    <path d="M10 9V3h4v6"/>
                    <path d="m8 16 1.5-5h5l1.5 5"/>
                    <path d="M6 21h12a2 2 0 0 0 1.66-3.11l-4.37-6.56a1 1 0 0 1-.16-.54V3H8.87v7.79a1 1 0 0 1-.16.54l-4.37 6.56A2 2 0 0 0 6 21z"/>
                </svg>`;
            }

            // Default: Syringe icon for Individual phlebotomist
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 2 4 4"/>
                <path d="m17 7 3-3"/>
                <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                <path d="m9 11 4 4"/>
                <path d="m5 19-3 3"/>
                <path d="m14 4 6 6"/>
            </svg>`;
        };

        // Helper function to create a single provider marker
        const createProviderMarker = (
            provider: Provider,
            position: { lat: number; lng: number },
            isSpiderfiedMarker: boolean = false
        ) => {
            const isSelected = selectedProvider?.id === provider.id;
            const isFullMatch = provider.services_matched === provider.services_total && (provider.services_total ?? 0) > 0;
            const price = provider.total_price ?? 0;
            const rating = provider.average_rating ?? 0;

            // Color coding: blue for selected, green for full match, orange for partial
            const markerBgColor = isSelected
                ? 'bg-blue-600 border-blue-800'
                : (isFullMatch ? 'bg-emerald-500 border-emerald-700' : 'bg-orange-500 border-orange-700');

            // Create marker element with price and rating labels
            const markerElement = document.createElement('div');
            markerElement.className = 'provider-marker';
            markerElement.innerHTML = `
                <style>
                    .provider-marker .marker-icon {
                        animation: marker-pulse 2s ease-in-out infinite;
                    }
                    .provider-marker:hover .marker-icon {
                        animation-play-state: paused;
                    }
                    @keyframes marker-pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.08); }
                    }
                    .provider-marker .marker-label {
                        background: rgba(255, 255, 255, 0.95);
                    }
                    .provider-marker .marker-label-price {
                        color: #111827;
                    }
                    @media (prefers-color-scheme: dark) {
                        .provider-marker .marker-label {
                            background: rgba(17, 24, 39, 0.95);
                        }
                        .provider-marker .marker-label-price {
                            color: #f3f4f6;
                        }
                    }
                </style>
                <div class="flex flex-col items-center cursor-pointer">
                    <div class="marker-icon ${markerBgColor} border-2 rounded-full p-2 shadow-lg transition-transform hover:scale-110 ${isSelected ? 'scale-110' : ''}">
                        ${getProviderIcon(provider.type?.name, isSelected)}
                    </div>
                    <div class="marker-label backdrop-blur-sm rounded px-1.5 py-0.5 shadow-md mt-1 text-center min-w-[50px]">
                        <div class="marker-label-price text-xs font-bold">£${price.toFixed(0)}</div>
                        <div class="text-[10px] text-yellow-600 flex items-center justify-center gap-0.5">
                            <span>★</span>
                            <span>${rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            `;

            const marker = new AdvancedMarkerElement({
                map: mapInstanceRef.current,
                position,
                content: markerElement,
                title: provider.user?.full_name || provider.provider_name || 'Provider',
            });

            // Skip interactions for already selected provider
            if (isSelected) {
                markerElement.style.cursor = 'default';
                return marker;
            }

            // Hover to show preview (InfoWindow without X button behavior)
            markerElement.addEventListener('mouseenter', () => {
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                }
                if (!infoWindowRef.current || !mapInstanceRef.current) {
                    return;
                }

                const matchText = provider.services_matched !== undefined && provider.services_total !== undefined
                    ? `${provider.services_matched} of ${provider.services_total} services`
                    : '';
                const matchColor = isFullMatch ? 'text-emerald-600' : 'text-orange-600';

                const isDark = document.documentElement.classList.contains('dark');
                const bgColor = isDark ? '#1f2937' : '#ffffff';
                const textColor = isDark ? '#f3f4f6' : '#111827';
                const secondaryColor = isDark ? '#d1d5db' : '#6b7280';
                const mutedColor = isDark ? '#9ca3af' : '#9ca3af';

                const content = `
                    <style>
                        .gm-style-iw-d { background: ${bgColor} !important; overflow: hidden !important; }
                        .gm-style-iw-c { background: ${bgColor} !important; }
                        .gm-style-iw-tc::after { background: ${bgColor} !important; }
                    </style>
                    <div class="p-3 max-w-[220px]">
                        <h3 class="font-semibold text-sm mb-2" style="color: ${textColor}">
                            ${provider.user?.full_name || provider.provider_name || 'Unknown Provider'}
                        </h3>
                        <div class="space-y-1 text-xs">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1">
                                    <span class="text-yellow-500">★</span>
                                    <span class="font-medium" style="color: ${textColor}">${rating.toFixed(1)}</span>
                                    <span style="color: ${mutedColor}">(${provider.total_reviews ?? 0})</span>
                                </div>
                                <span class="font-bold" style="color: ${textColor}">£${price.toFixed(2)}</span>
                            </div>
                            ${provider.distance_km !== undefined ? `
                                <div style="color: ${secondaryColor}">${provider.distance_km.toFixed(1)} km away</div>
                            ` : ''}
                            ${matchText ? `<div class="${matchColor} font-medium">${matchText}</div>` : ''}
                        </div>
                    </div>
                `;

                infoWindowRef.current.setContent(content);
                infoWindowRef.current.open({
                    map: mapInstanceRef.current,
                    anchor: marker,
                });
            });

            // Hide preview on mouse leave
            markerElement.addEventListener('mouseleave', () => {
                hoverTimeoutRef.current = setTimeout(() => {
                    infoWindowRef.current?.close();
                    hoverTimeoutRef.current = null;
                }, 100);
            });

            // Click to open detail modal
            markerElement.addEventListener('click', () => {
                infoWindowRef.current?.close();
                onProviderClick(provider);
            });

            return marker;
        };

        // Helper function to spiderfy a cluster
        const spiderfyCluster = (cluster: Cluster<Provider & { latitude: number; longitude: number }>) => {
            if (!mapInstanceRef.current) return;

            // Inline spiderfy cleanup
            spiderfyMarkersRef.current.forEach((m) => { m.map = null; });
            spiderfyMarkersRef.current.clear();
            spiderfyLinesRef.current.forEach((l) => { l.setMap(null); });
            spiderfyLinesRef.current = [];

            // Hide the original cluster marker
            const clusterMarker = providerMarkersRef.current.get(cluster.id);
            if (clusterMarker) {
                clusterMarker.map = null;
            }

            // Calculate spiderfy radius based on zoom
            const zoom = currentZoomRef.current;
            const spiderfyRadius = zoom >= 16 ? 0.03 : zoom >= 14 ? 0.05 : zoom >= 12 ? 0.1 : 0.2;

            // Get positions for spiderfied markers
            const positions = spiderfyPositions(cluster.center, cluster.items.length, spiderfyRadius);

            // Create spiderfied markers and lines
            cluster.items.forEach((item, index) => {
                const position = positions[index];
                const marker = createProviderMarker(item, position, true);

                if (marker) {
                    spiderfyMarkersRef.current.set(item.id, marker);
                }

                // Create line from cluster center to spiderfied position
                const line = new google.maps.Polyline({
                    path: [cluster.center, position],
                    strokeColor: '#9ca3af',
                    strokeWeight: 1,
                    strokeOpacity: 0.6,
                    map: mapInstanceRef.current,
                });

                spiderfyLinesRef.current.push(line);
            });

            setIsSpiderfied(cluster.id);
        };

        // Separate selectedProvider from clustering
        const providersToCluster = providers.filter(
            (p) => p.latitude && p.longitude && p.id !== selectedProvider?.id
        );

        // Convert to clusterable format
        const clusterableProviders = providersToCluster.map((p) => ({
            id: p.id,
            latitude: p.latitude!,
            longitude: p.longitude!,
            ...p,
        }));

        // Cluster providers based on zoom
        const clusterDistance = getClusterDistance(currentZoom);
        const clusters = clusterItems(clusterableProviders, clusterDistance);

        // Render clusters and markers
        clusters.forEach((cluster) => {
            if (cluster.isCluster) {
                // Create cluster marker
                const markerElement = document.createElement('div');
                markerElement.className = 'cluster-marker';
                markerElement.innerHTML = `
                    <style>
                        .cluster-marker .cluster-icon {
                            animation: cluster-pulse 2s ease-in-out infinite;
                        }
                        .cluster-marker:hover .cluster-icon {
                            animation-play-state: paused;
                            transform: scale(1.1);
                        }
                        @keyframes cluster-pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                        }
                    </style>
                    <div class="flex flex-col items-center cursor-pointer">
                        <div class="cluster-icon bg-white/95 border-2 border-gray-300 rounded-full w-11 h-11 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm">
                            <span class="text-gray-800 font-bold text-sm leading-none">${cluster.items.length}</span>
                            <svg width="14" height="10" viewBox="0 0 24 16" fill="none" stroke="#6b7280" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5">
                                <path d="M16 14v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1"/>
                                <circle cx="10" cy="4" r="3"/>
                                <path d="M20 14v-1a3 3 0 0 0-2.1-2.9"/>
                                <path d="M15.5 1.1a3 3 0 0 1 0 5.8"/>
                            </svg>
                        </div>
                    </div>
                `;

                const clusterMarker = new AdvancedMarkerElement({
                    map: mapInstanceRef.current,
                    position: cluster.center,
                    content: markerElement,
                    title: `${cluster.items.length} providers`,
                });

                // Click to spiderfy cluster
                markerElement.addEventListener('click', () => {
                    infoWindowRef.current?.close();
                    spiderfyCluster(cluster);
                });

                providerMarkersRef.current.set(cluster.id, clusterMarker);
            } else {
                // Single provider - create normal marker
                const provider = cluster.items[0];
                const position = { lat: provider.latitude, lng: provider.longitude };
                const marker = createProviderMarker(provider, position);

                if (marker) {
                    providerMarkersRef.current.set(provider.id, marker);
                }
            }
        });

        // Always create individual marker for selectedProvider
        if (selectedProvider && selectedProvider.latitude && selectedProvider.longitude) {
            const position = { lat: selectedProvider.latitude, lng: selectedProvider.longitude };
            const marker = createProviderMarker(selectedProvider, position);

            if (marker) {
                providerMarkersRef.current.set(selectedProvider.id, marker);
            }
        }

    }, [providers, selectedProvider, libraries, isLoaded, onProviderClick, currentZoom]);

    if (loadError || mapError || !googleMapsKey) {
        return (
            <div className={cn('relative w-full h-[450px] bg-muted rounded-2xl flex flex-col items-center justify-center p-6', className)}>
                <MapPin className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    {!googleMapsKey ? 'Google Maps API key not configured' : loadError?.message || 'Map unavailable'}
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={cn('relative w-full h-[450px] bg-muted rounded-2xl flex items-center justify-center', className)}>
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('relative w-full h-[450px] rounded-2xl overflow-hidden border border-border', className)}>
            <div ref={mapRef} className="absolute inset-0" />
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg z-10">
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {providers.length} provider{providers.length !== 1 ? 's' : ''} nearby
                </p>
            </div>
        </div>
    );
}

// Mapbox Implementation
function MapboxProviderMap({
    providers,
    userLocation,
    selectedProvider,
    onProviderClick,
    mapboxToken,
    className,
}: ProviderMapProps & { mapboxToken?: string }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const providerMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const [mapError, setMapError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentZoom, setCurrentZoom] = useState(12);
    const currentZoomRef = useRef(12);
    const [isSpiderfied, setIsSpiderfied] = useState<string | null>(null);
    const spiderfyMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const spiderfyLinesRef = useRef<string[]>([]); // Store line layer IDs

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
                center: [userLocation.lng, userLocation.lat],
                zoom: 12,
            });

            mapRef.current.addControl(new mapboxgl.NavigationControl());

            // Create user location marker (Google Maps-style blue dot with glow)
            const userMarkerElement = document.createElement('div');
            userMarkerElement.innerHTML = `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
                    <div class="absolute w-6 h-6 bg-blue-500/20 rounded-full"></div>
                    <div class="relative w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>
            `;

            userMarkerRef.current = new mapboxgl.Marker({ element: userMarkerElement })
                .setLngLat([userLocation.lng, userLocation.lat])
                .addTo(mapRef.current);

            // Create popup (no close button for hover preview)
            popupRef.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 25,
            });

            mapRef.current.on('load', () => {
                setIsLoading(false);
            });

            // Listen for zoom changes
            mapRef.current.on('zoom', () => {
                const zoom = mapRef.current?.getZoom();
                if (zoom !== undefined) {
                    currentZoomRef.current = zoom;
                    setCurrentZoom(zoom);
                }
            });

            // Listen for map clicks (to collapse spiderfy)
            mapRef.current.on('click', (e) => {
                // Only clear if clicking on the map, not on a marker
                if (!e.originalEvent.defaultPrevented) {
                    clearSpiderfyMapbox();
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
    }, [mapboxToken, userLocation]);

    // Helper to clear spiderfied state (Mapbox)
    const clearSpiderfyMapbox = useCallback(() => {
        if (!isSpiderfied || !mapRef.current) return;

        // Remove spiderfy markers
        spiderfyMarkersRef.current.forEach((marker) => {
            marker.remove();
        });
        spiderfyMarkersRef.current.clear();

        // Remove spiderfy line layers
        spiderfyLinesRef.current.forEach((layerId) => {
            if (mapRef.current && mapRef.current.getLayer(layerId)) {
                mapRef.current.removeLayer(layerId);
            }
            if (mapRef.current && mapRef.current.getSource(layerId)) {
                mapRef.current.removeSource(layerId);
            }
        });
        spiderfyLinesRef.current = [];

        setIsSpiderfied(null);
    }, [isSpiderfied]);

    // Fit bounds when providers change (separate from marker rendering)
    useEffect(() => {
        if (!mapRef.current || isLoading || providers.length === 0) return;

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userLocation.lng, userLocation.lat]);

        // Include all valid providers so the map zooms to show user + all providers
        const validProviders = providers.filter((p) => p.latitude && p.longitude);
        validProviders.forEach((p) => {
            bounds.extend([p.longitude!, p.latitude!]);
        });

        mapRef.current.fitBounds(bounds, { padding: 60 });
    }, [providers, userLocation, isLoading]);

    // Update provider markers
    useEffect(() => {
        if (!mapRef.current || !mapboxToken || isLoading) {
            return;
        }

        // Clear existing markers
        providerMarkersRef.current.forEach((marker) => {
            marker.remove();
        });
        providerMarkersRef.current.clear();

        // Inline spiderfy cleanup
        spiderfyMarkersRef.current.forEach((marker) => {
            marker.remove();
        });
        spiderfyMarkersRef.current.clear();
        spiderfyLinesRef.current.forEach((layerId) => {
            if (mapRef.current && mapRef.current.getLayer(layerId)) {
                mapRef.current.removeLayer(layerId);
            }
            if (mapRef.current && mapRef.current.getSource(layerId)) {
                mapRef.current.removeSource(layerId);
            }
        });
        spiderfyLinesRef.current = [];
        setIsSpiderfied(null);

        // Helper function to get icon SVG based on provider type
        const getProviderIcon = (typeName: string | undefined, isSelected: boolean) => {
            if (isSelected) {
                // Checkmark for selected
                return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>`;
            }

            const type = typeName?.toLowerCase() || '';

            if (type === 'clinic') {
                // Hospital/clinic building with medical cross
                return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M12 8v8"/>
                    <path d="M8 12h8"/>
                </svg>`;
            }

            if (type === 'laboratory') {
                // Flask/test tube icon
                return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 3h6"/>
                    <path d="M10 9V3h4v6"/>
                    <path d="m8 16 1.5-5h5l1.5 5"/>
                    <path d="M6 21h12a2 2 0 0 0 1.66-3.11l-4.37-6.56a1 1 0 0 1-.16-.54V3H8.87v7.79a1 1 0 0 1-.16.54l-4.37 6.56A2 2 0 0 0 6 21z"/>
                </svg>`;
            }

            // Default: Syringe icon for Individual phlebotomist
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 2 4 4"/>
                <path d="m17 7 3-3"/>
                <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                <path d="m9 11 4 4"/>
                <path d="m5 19-3 3"/>
                <path d="m14 4 6 6"/>
            </svg>`;
        };

        // Helper function to create a single provider marker
        const createProviderMarker = (
            provider: Provider,
            lngLat: [number, number],
            isSpiderfiedMarker: boolean = false
        ) => {
            const isSelected = selectedProvider?.id === provider.id;
            const isFullMatch = provider.services_matched === provider.services_total && (provider.services_total ?? 0) > 0;
            const price = provider.total_price ?? 0;
            const rating = provider.average_rating ?? 0;

            // Color coding: blue for selected, green for full match, orange for partial
            const markerBgColor = isSelected
                ? 'bg-blue-600 border-blue-800'
                : (isFullMatch ? 'bg-emerald-500 border-emerald-700' : 'bg-orange-500 border-orange-700');

            // Create marker element with price and rating labels
            const markerElement = document.createElement('div');
            markerElement.className = 'provider-marker-mapbox';
            markerElement.innerHTML = `
                <style>
                    .provider-marker-mapbox .marker-icon {
                        animation: marker-pulse-mapbox 2s ease-in-out infinite;
                    }
                    .provider-marker-mapbox:hover .marker-icon {
                        animation-play-state: paused;
                    }
                    @keyframes marker-pulse-mapbox {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.08); }
                    }
                    .provider-marker-mapbox .marker-label {
                        background: rgba(255, 255, 255, 0.95);
                    }
                    .provider-marker-mapbox .marker-label-price {
                        color: #111827;
                    }
                    @media (prefers-color-scheme: dark) {
                        .provider-marker-mapbox .marker-label {
                            background: rgba(17, 24, 39, 0.95);
                        }
                        .provider-marker-mapbox .marker-label-price {
                            color: #f3f4f6;
                        }
                    }
                </style>
                <div class="flex flex-col items-center cursor-pointer">
                    <div class="marker-icon ${markerBgColor} border-2 rounded-full p-2 shadow-lg transition-transform hover:scale-110 ${isSelected ? 'scale-110' : ''}">
                        ${getProviderIcon(provider.type?.name, isSelected)}
                    </div>
                    <div class="marker-label backdrop-blur-sm rounded px-1.5 py-0.5 shadow-md mt-1 text-center min-w-[50px]">
                        <div class="marker-label-price text-xs font-bold">£${price.toFixed(0)}</div>
                        <div class="text-[10px] text-yellow-600 flex items-center justify-center gap-0.5">
                            <span>★</span>
                            <span>${rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            `;

            const marker = new mapboxgl.Marker({ element: markerElement })
                .setLngLat(lngLat)
                .addTo(mapRef.current!);

            // Skip interactions for already selected provider
            if (isSelected) {
                markerElement.style.cursor = 'default';
                return marker;
            }

            const matchText = provider.services_matched !== undefined && provider.services_total !== undefined
                ? `${provider.services_matched} of ${provider.services_total} services`
                : '';
            const matchColor = isFullMatch ? 'text-emerald-600' : 'text-orange-600';

            // Hover to show preview popup
            markerElement.addEventListener('mouseenter', () => {
                if (!popupRef.current || !mapRef.current) {
                    return;
                }

                const popupContent = document.createElement('div');
                popupContent.className = 'p-3 max-w-[220px] mapbox-popup-content';
                popupContent.innerHTML = `
                    <style>
                        .mapbox-popup-content { color: #111827; }
                        .mapbox-popup-secondary { color: #6b7280; }
                        .mapbox-popup-muted { color: #9ca3af; }
                        @media (prefers-color-scheme: dark) {
                            .mapbox-popup-content { color: #f3f4f6; background: #1f2937; }
                            .mapbox-popup-secondary { color: #d1d5db; }
                            .mapbox-popup-muted { color: #9ca3af; }
                            .mapboxgl-popup-content { background: #1f2937 !important; }
                            .mapboxgl-popup-tip { border-top-color: #1f2937 !important; }
                        }
                    </style>
                    <h3 class="font-semibold text-sm mb-2">
                        ${provider.user?.full_name || provider.provider_name || 'Unknown Provider'}
                    </h3>
                    <div class="space-y-1 text-xs">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-1">
                                <span class="text-yellow-500">★</span>
                                <span class="font-medium">${rating.toFixed(1)}</span>
                                <span class="mapbox-popup-muted">(${provider.total_reviews ?? 0})</span>
                            </div>
                            <span class="font-bold">£${price.toFixed(2)}</span>
                        </div>
                        ${provider.distance_km !== undefined ? `
                            <div class="mapbox-popup-secondary">${provider.distance_km.toFixed(1)} km away</div>
                        ` : ''}
                        ${matchText ? `<div class="${matchColor} font-medium">${matchText}</div>` : ''}
                    </div>
                `;

                popupRef.current
                    .setLngLat(lngLat)
                    .setDOMContent(popupContent)
                    .addTo(mapRef.current!);
            });

            // Hide preview on mouse leave
            markerElement.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    popupRef.current?.remove();
                }, 100);
            });

            // Click to open detail modal
            markerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                popupRef.current?.remove();
                onProviderClick(provider);
            });

            return marker;
        };

        // Helper function to spiderfy a cluster
        const spiderfyCluster = (cluster: Cluster<Provider & { latitude: number; longitude: number }>) => {
            if (!mapRef.current) return;

            // Inline spiderfy cleanup
            spiderfyMarkersRef.current.forEach((m) => { m.remove(); });
            spiderfyMarkersRef.current.clear();
            spiderfyLinesRef.current.forEach((layerId) => {
                if (mapRef.current && mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
                if (mapRef.current && mapRef.current.getSource(layerId)) mapRef.current.removeSource(layerId);
            });
            spiderfyLinesRef.current = [];

            // Hide the original cluster marker
            const clusterMarker = providerMarkersRef.current.get(cluster.id);
            if (clusterMarker) {
                clusterMarker.remove();
            }

            // Calculate spiderfy radius based on zoom
            const zoom = currentZoomRef.current;
            const spiderfyRadius = zoom >= 16 ? 0.03 : zoom >= 14 ? 0.05 : zoom >= 12 ? 0.1 : 0.2;

            // Get positions for spiderfied markers
            const positions = spiderfyPositions(cluster.center, cluster.items.length, spiderfyRadius);

            // Create spiderfied markers and lines
            cluster.items.forEach((item, index) => {
                const position = positions[index];
                const lngLat: [number, number] = [position.lng, position.lat];
                const marker = createProviderMarker(item, lngLat, true);

                if (marker) {
                    spiderfyMarkersRef.current.set(item.id, marker);
                }

                // Create line from cluster center to spiderfied position using GeoJSON
                const lineId = `spiderfy-line-${cluster.id}-${index}`;
                const sourceId = lineId;

                mapRef.current!.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [cluster.center.lng, cluster.center.lat],
                                [position.lng, position.lat],
                            ],
                        },
                    },
                });

                mapRef.current!.addLayer({
                    id: lineId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': '#9ca3af',
                        'line-width': 1,
                        'line-opacity': 0.6,
                    },
                });

                spiderfyLinesRef.current.push(lineId);
            });

            setIsSpiderfied(cluster.id);
        };

        // Separate selectedProvider from clustering
        const providersToCluster = providers.filter(
            (p) => p.latitude && p.longitude && p.id !== selectedProvider?.id
        );

        // Convert to clusterable format
        const clusterableProviders = providersToCluster.map((p) => ({
            id: p.id,
            latitude: p.latitude!,
            longitude: p.longitude!,
            ...p,
        }));

        // Cluster providers based on zoom
        const clusterDistance = getClusterDistance(currentZoom);
        const clusters = clusterItems(clusterableProviders, clusterDistance);

        // Render clusters and markers
        clusters.forEach((cluster) => {
            if (cluster.isCluster) {
                // Create cluster marker
                const markerElement = document.createElement('div');
                markerElement.className = 'cluster-marker-mapbox';
                markerElement.innerHTML = `
                    <style>
                        .cluster-marker-mapbox .cluster-icon {
                            animation: cluster-pulse-mapbox 2s ease-in-out infinite;
                        }
                        .cluster-marker-mapbox:hover .cluster-icon {
                            animation-play-state: paused;
                            transform: scale(1.1);
                        }
                        @keyframes cluster-pulse-mapbox {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                        }
                    </style>
                    <div class="flex flex-col items-center cursor-pointer">
                        <div class="cluster-icon bg-white/95 border-2 border-gray-300 rounded-full w-11 h-11 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm">
                            <span class="text-gray-800 font-bold text-sm leading-none">${cluster.items.length}</span>
                            <svg width="14" height="10" viewBox="0 0 24 16" fill="none" stroke="#6b7280" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5">
                                <path d="M16 14v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1"/>
                                <circle cx="10" cy="4" r="3"/>
                                <path d="M20 14v-1a3 3 0 0 0-2.1-2.9"/>
                                <path d="M15.5 1.1a3 3 0 0 1 0 5.8"/>
                            </svg>
                        </div>
                    </div>
                `;

                const clusterMarker = new mapboxgl.Marker({ element: markerElement })
                    .setLngLat([cluster.center.lng, cluster.center.lat])
                    .addTo(mapRef.current!);

                // Click to spiderfy cluster
                markerElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    popupRef.current?.remove();
                    spiderfyCluster(cluster);
                });

                providerMarkersRef.current.set(cluster.id, clusterMarker);
            } else {
                // Single provider - create normal marker
                const provider = cluster.items[0];
                const lngLat: [number, number] = [provider.longitude, provider.latitude];
                const marker = createProviderMarker(provider, lngLat);

                if (marker) {
                    providerMarkersRef.current.set(provider.id, marker);
                }
            }
        });

        // Always create individual marker for selectedProvider
        if (selectedProvider && selectedProvider.latitude && selectedProvider.longitude) {
            const lngLat: [number, number] = [selectedProvider.longitude, selectedProvider.latitude];
            const marker = createProviderMarker(selectedProvider, lngLat);

            if (marker) {
                providerMarkersRef.current.set(selectedProvider.id, marker);
            }
        }

    }, [providers, selectedProvider, onProviderClick, mapboxToken, currentZoom, isLoading]);

    if (mapError || !mapboxToken) {
        return (
            <div className={cn('relative w-full h-[450px] bg-muted rounded-2xl flex flex-col items-center justify-center p-6', className)}>
                <MapPin className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    {!mapboxToken ? 'Mapbox access token not configured' : 'Map unavailable'}
                </p>
            </div>
        );
    }

    return (
        <div className={cn('relative w-full h-[450px] rounded-2xl overflow-hidden border border-border', className)}>
            <div ref={mapContainerRef} className="absolute inset-0" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg z-10">
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {providers.length} provider{providers.length !== 1 ? 's' : ''} nearby
                </p>
            </div>
        </div>
    );
}
