import { ChevronLeft } from "lucide-react";
import { Button } from "./button";

interface BookingHeaderProps {
  title: string;
  onBack?: () => void;
}

export function BookingHeader({ title, onBack }: BookingHeaderProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
    </div>
  );
}
