import { X } from "lucide-react";
import { Button } from "./button";

interface BookingChatProps {
  bookingId: string;
  phlebotomistName: string;
  phlebotomistImage?: string;
  onClose: () => void;
}

export function BookingChat({
  bookingId,
  phlebotomistName,
  phlebotomistImage,
  onClose,
}: BookingChatProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {phlebotomistImage ? (
              <img
                src={phlebotomistImage}
                alt={phlebotomistName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {phlebotomistName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground">{phlebotomistName}</h3>
              <p className="text-xs text-muted-foreground">Booking #{bookingId.slice(0, 8)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-muted-foreground text-center">
            Chat functionality coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
