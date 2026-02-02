import { lazy, Suspense, type ComponentProps } from 'react';
import { Spinner } from '@/components/ui/spinner';

// Lazy load the heavy map components
const MapProvider = lazy(() =>
    import('./map-provider').then((m) => ({ default: m.MapProvider })),
);
const AutocompleteProvider = lazy(() =>
    import('./autocomplete-provider').then((m) => ({
        default: m.AutocompleteProvider,
    })),
);

// Loading fallback component for map
function MapLoadingFallback() {
    return (
        <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
                <Spinner className="mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
        </div>
    );
}

// Loading fallback component for autocomplete
function AutocompleteLoadingFallback() {
    return <div className="h-10 animate-pulse rounded-md bg-muted" />;
}

// Lazy wrapper components
export function LazyMapProvider(props: ComponentProps<typeof MapProvider>) {
    return (
        <Suspense fallback={<MapLoadingFallback />}>
            <MapProvider {...props} />
        </Suspense>
    );
}

export function LazyAutocompleteProvider(
    props: ComponentProps<typeof AutocompleteProvider>,
) {
    return (
        <Suspense fallback={<AutocompleteLoadingFallback />}>
            <AutocompleteProvider {...props} />
        </Suspense>
    );
}
