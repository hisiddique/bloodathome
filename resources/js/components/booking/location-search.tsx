import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LocationMap } from "./location-map";
import { ConfirmButton } from "./confirm-button";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  onLocationSelect: (postcode: string, coordinates?: [number, number]) => void;
  onBack: () => void;
  collectionTypeLabel: string;
}

export function LocationSearch({
  onLocationSelect,
  onBack,
  collectionTypeLabel,
}: LocationSearchProps) {
  const { mapboxToken } = usePage<{ mapboxToken?: string }>().props;
  const [postcode, setPostcode] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number]>([
    -0.1276, 51.5074,
  ]); // Default London
  const [isSearching, setIsSearching] = useState(false);

  const geocodePostcode = async (postcodeValue: string) => {
    if (!mapboxToken || postcodeValue.length < 3) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postcodeValue + ", UK")}.json?access_token=${mapboxToken}&country=GB&types=postcode`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCoordinates([lng, lat]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePostcodeChange = (value: string) => {
    setPostcode(value.toUpperCase());

    // UK postcode pattern check - auto search when valid format
    const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    if (ukPostcodeRegex.test(value.trim())) {
      geocodePostcode(value);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);

        // Reverse geocode to get postcode
        if (mapboxToken) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=postcode`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              const postcodeResult =
                data.features[0].text || data.features[0].place_name;
              setPostcode(postcodeResult.toUpperCase());
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
          }
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        setIsLocating(false);
        alert("Unable to get your location. Please enter your postcode manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSearch = () => {
    if (postcode.trim()) {
      onLocationSelect(postcode.trim(), coordinates);
    }
  };

  const isValidPostcode = postcode.trim().length >= 5;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to collection types
      </button>

      {/* Selected Service */}
      <div className="p-4 rounded-xl border border-primary bg-primary/5">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">
              {collectionTypeLabel}
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter your postcode to find nearby phlebotomists
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <LocationMap
          center={coordinates}
          zoom={13}
          mapboxToken={mapboxToken || ""}
          markers={
            postcode ? [{ id: "user", coordinates, label: postcode }] : []
          }
        />
      </div>

      {/* Postcode Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Enter your postcode
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            value={postcode}
            onChange={(e) => handlePostcodeChange(e.target.value)}
            placeholder="e.g., SW1A 1AA"
            className="pl-12 pr-12 py-6 rounded-2xl border-border bg-card text-lg"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
          )}
        </div>
      </div>

      {/* Use My Location Button */}
      <button
        onClick={handleUseLocation}
        disabled={isLocating}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-medium transition-all border border-border",
          "bg-muted text-foreground hover:bg-accent",
          isLocating && "opacity-70 cursor-wait"
        )}
      >
        <Navigation className={cn("w-5 h-5", isLocating && "animate-pulse")} />
        {isLocating ? "Getting your location..." : "Use my current location"}
      </button>

      {/* Search Button */}
      <ConfirmButton onClick={handleSearch} disabled={!isValidPostcode}>
        <span className="flex items-center justify-center gap-2">
          <Search className="w-5 h-5" />
          Find Nearby Phlebotomists
        </span>
      </ConfirmButton>
    </div>
  );
}

export default LocationSearch;
