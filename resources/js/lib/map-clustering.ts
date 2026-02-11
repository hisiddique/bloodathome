/**
 * Simple marker clustering utility for provider maps
 */

export interface ClusterableItem {
    id: string;
    latitude: number;
    longitude: number;
}

export interface Cluster<T extends ClusterableItem> {
    id: string;
    items: T[];
    center: { lat: number; lng: number };
    isCluster: boolean;
}

/**
 * Calculate distance between two points in kilometers using Haversine formula
 */
function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Group items into clusters based on proximity
 * @param items - Array of items with lat/lng
 * @param clusterDistanceKm - Distance threshold for clustering (in km)
 * @returns Array of clusters
 */
export function clusterItems<T extends ClusterableItem>(
    items: T[],
    clusterDistanceKm: number = 0.5
): Cluster<T>[] {
    if (items.length === 0) return [];

    const clusters: Cluster<T>[] = [];
    const processed = new Set<string>();

    for (const item of items) {
        if (processed.has(item.id)) continue;

        // Find all nearby items that haven't been processed
        const nearby = items.filter((other) => {
            if (processed.has(other.id)) return false;
            if (other.id === item.id) return true;
            const distance = haversineDistance(
                item.latitude,
                item.longitude,
                other.latitude,
                other.longitude
            );
            return distance <= clusterDistanceKm;
        });

        // Mark all as processed
        nearby.forEach((n) => processed.add(n.id));

        // Calculate cluster center
        const center = {
            lat: nearby.reduce((sum, n) => sum + n.latitude, 0) / nearby.length,
            lng: nearby.reduce((sum, n) => sum + n.longitude, 0) / nearby.length,
        };

        clusters.push({
            id: nearby.length === 1 ? item.id : `cluster-${item.id}`,
            items: nearby,
            center,
            isCluster: nearby.length > 1,
        });
    }

    return clusters;
}

/**
 * Calculate positions for spiderfied markers (arranged in a circle)
 * @param center - Center position
 * @param count - Number of markers
 * @param radiusKm - Radius of the spider circle in km
 * @returns Array of positions
 */
export function spiderfyPositions(
    center: { lat: number; lng: number },
    count: number,
    radiusKm: number = 0.05
): { lat: number; lng: number }[] {
    const positions: { lat: number; lng: number }[] = [];
    const angleStep = (2 * Math.PI) / count;

    // Convert km to approximate degrees
    const radiusLat = radiusKm / 111.32; // 1 degree lat ≈ 111.32 km
    const radiusLng = radiusKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));

    for (let i = 0; i < count; i++) {
        const angle = i * angleStep - Math.PI / 2; // Start from top
        positions.push({
            lat: center.lat + radiusLat * Math.sin(angle),
            lng: center.lng + radiusLng * Math.cos(angle),
        });
    }

    return positions;
}

/**
 * Check if items are at the same location (within a very small threshold)
 */
export function isSameLocation(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    thresholdKm: number = 0.01
): boolean {
    return haversineDistance(lat1, lng1, lat2, lng2) <= thresholdKm;
}

/**
 * Determine cluster distance based on zoom level
 * Higher zoom = smaller cluster distance
 */
export function getClusterDistance(zoom: number): number {
    if (zoom >= 16) return 0.05; // 50m - very close
    if (zoom >= 14) return 0.1; // 100m
    if (zoom >= 12) return 0.3; // 300m
    if (zoom >= 10) return 0.5; // 500m
    return 1; // 1km for zoomed out
}
