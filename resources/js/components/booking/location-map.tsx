import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Settings } from "lucide-react";

interface LocationMapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number];
    label?: string;
  }>;
  mapboxToken: string;
}

export function LocationMap({
  center,
  zoom = 12,
  markers = [],
  mapboxToken,
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      setMapError(true);
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: center,
        zoom: zoom,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }),
        "top-right"
      );

      // Add markers
      markers.forEach((marker) => {
        new mapboxgl.Marker({ color: "#60a5fa" })
          .setLngLat(marker.coordinates)
          .addTo(map.current!);
      });

      setMapError(false);
    } catch (error) {
      console.error("Map error:", error);
      setMapError(true);
    }

    return () => {
      map.current?.remove();
    };
  }, [center, zoom, markers, mapboxToken]);

  if (mapError || !mapboxToken) {
    return (
      <div className="relative w-full h-64 bg-muted rounded-2xl flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-muted to-border rounded-2xl" />
        </div>
        <div className="relative z-10 text-center space-y-2">
          <Settings className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Map unavailable - Mapbox token not configured
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}

export default LocationMap;
