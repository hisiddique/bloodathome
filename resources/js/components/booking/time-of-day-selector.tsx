import { cn } from "@/lib/utils";

export type TimeOfDay = "morning" | "afternoon" | "evening";

interface TimeOfDaySelectorProps {
  selected: TimeOfDay;
  onSelect: (time: TimeOfDay) => void;
}

export function TimeOfDaySelector({ selected, onSelect }: TimeOfDaySelectorProps) {
  const options: { value: TimeOfDay; label: string }[] = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={cn(
            "px-6 py-3 rounded-full text-sm font-medium transition-all duration-200",
            selected === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-foreground hover:border-primary/50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default TimeOfDaySelector;
