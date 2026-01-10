import { ChevronLeft } from "lucide-react";

interface BookingHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function BookingHeader({
  title,
  onBack,
  showBack = true,
}: BookingHeaderProps) {
  return (
    <header className="flex items-center gap-4 py-4">
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" aria-hidden="true" />
        </button>
      )}
      <h1 className="text-lg font-semibold text-foreground flex-1 text-center lg:pr-0 pr-8">
        {title}
      </h1>
    </header>
  );
}

export default BookingHeader;
