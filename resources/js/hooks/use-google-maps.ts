import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface UseGoogleMapsReturn {
    isLoaded: boolean;
    loadError: Error | null;
    google: typeof globalThis.google | null;
}

export function useGoogleMaps(
    apiKey: string | undefined,
): UseGoogleMapsReturn {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const [google, setGoogle] = useState<typeof globalThis.google | null>(
        null,
    );

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
        if (window.google?.maps) {
            setIsLoaded(true);
            setGoogle(window.google);
            return;
        }

        const loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places', 'marker', 'geometry'],
        });

        loader
            .load()
            .then(() => {
                setIsLoaded(true);
                setGoogle(window.google);
                setLoadError(null);
            })
            .catch((error) => {
                console.error('Error loading Google Maps:', error);
                setLoadError(error);
                setIsLoaded(false);
            });
    }, [apiKey]);

    return { isLoaded, loadError, google };
}
