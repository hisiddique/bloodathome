import { format, addDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        return (
          <button
            key={date.toISOString()}
            onClick={() => onDateSelect(date)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-full transition-all duration-200",
              "border-2 flex-shrink-0",
              isSelected
                ? "bg-accent border-primary"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <span
              className={cn(
                "text-xs font-medium",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {format(date, "MMM dd")}
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                isSelected ? "text-foreground" : "text-foreground"
              )}
            >
              {format(date, "EEE")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default DateSelector;
