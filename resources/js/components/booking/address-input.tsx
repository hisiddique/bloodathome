import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onUseLocation: () => void;
  isLocating?: boolean;
}

export function AddressInput({
  value,
  onChange,
  onUseLocation,
  isLocating,
}: AddressInputProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your home address"
          className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>

      <button
        onClick={onUseLocation}
        disabled={isLocating}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-medium transition-all",
          "bg-foreground text-background hover:opacity-90",
          isLocating && "opacity-70 cursor-wait"
        )}
      >
        <Navigation className={cn("w-5 h-5", isLocating && "animate-pulse")} />
        {isLocating ? "Getting location..." : "Enable location"}
      </button>
    </div>
  );
}

export default AddressInput;
