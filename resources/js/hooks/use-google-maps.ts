import { useState, useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export interface GoogleMapsLibraries {
    Map: typeof google.maps.Map;
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
    places: google.maps.PlacesLibrary;
    geometry: google.maps.GeometryLibrary;
}

export interface UseGoogleMapsReturn {
    isLoaded: boolean;
    loadError: Error | null;
    libraries: GoogleMapsLibraries | null;
}

let isOptionsSet = false;
let cachedLibraries: GoogleMapsLibraries | null = null;

export function useGoogleMaps(
    apiKey: string | undefined,
): UseGoogleMapsReturn {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const [libraries, setLibraries] = useState<GoogleMapsLibraries | null>(cachedLibraries);
    const loadingRef = useRef(false);

    useEffect(() => {
        if (!apiKey) {
            setLoadError(
                new Error(
                    'Google Maps API key not configured. Please add it in admin settings.',
                ),
            );
            return;
        }

        // Check if already loaded
        if (cachedLibraries) {
            setIsLoaded(true);
            setLibraries(cachedLibraries);
            return;
        }

        // Prevent multiple simultaneous loads
        if (loadingRef.current) {
            return;
        }

        loadingRef.current = true;

        // Set options only once globally
        if (!isOptionsSet) {
            setOptions({
                key: apiKey,
                version: 'weekly',
            });
            isOptionsSet = true;
        }

        // Load required libraries using the new functional API
        // importLibrary() returns the library objects directly
        Promise.all([
            importLibrary('maps') as Promise<google.maps.MapsLibrary>,
            importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
            importLibrary('places') as Promise<google.maps.PlacesLibrary>,
            importLibrary('geometry') as Promise<google.maps.GeometryLibrary>,
        ])
            .then(([mapsLib, markerLib, placesLib, geometryLib]) => {
                cachedLibraries = {
                    Map: mapsLib.Map,
                    AdvancedMarkerElement: markerLib.AdvancedMarkerElement,
                    places: placesLib,
                    geometry: geometryLib,
                };
                setLibraries(cachedLibraries);
                setIsLoaded(true);
                setLoadError(null);
                loadingRef.current = false;
            })
            .catch((error) => {
                console.error('Error loading Google Maps:', error);
                setLoadError(error);
                setIsLoaded(false);
                loadingRef.current = false;
            });
    }, [apiKey]);

    return { isLoaded, loadError, libraries };
}
