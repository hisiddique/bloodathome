import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Phlebotomist {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
  price: number;
  available: boolean;
  experience: string;
}

interface PhlebotomistCardProps {
  phlebotomist: Phlebotomist;
  isSelected: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
}

export function PhlebotomistCard({
  phlebotomist,
  isSelected,
  onSelect,
  onViewProfile,
}: PhlebotomistCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-3xl p-4 border-2 transition-all duration-200",
        isSelected ? "border-primary" : "border-border"
      )}
    >
      <div className="flex gap-4">
        <img
          src={phlebotomist.image}
          alt={phlebotomist.name}
          className="w-24 h-24 rounded-2xl object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-foreground">
              {phlebotomist.name}
            </h3>
            <span className="text-foreground font-bold">
              {phlebotomist.price}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                phlebotomist.available ? "bg-green-500" : "bg-muted"
              )}
            />
            <span
              className={cn(
                "text-sm",
                phlebotomist.available
                  ? "text-green-600"
                  : "text-muted-foreground"
              )}
            >
              {phlebotomist.available ? "Available Now" : "Unavailable"}
            </span>
            <span className="text-primary text-sm font-medium ml-auto">
              Free for members
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{phlebotomist.distance} away</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onViewProfile}
              className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              View Profile
            </button>
            <button
              onClick={onSelect}
              className={cn(
                "flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {isSelected ? "Selected" : "Select"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhlebotomistCard;
