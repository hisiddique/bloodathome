import { cn } from "@/lib/utils";
import type { TimeOfDay } from "./time-of-day-selector";

interface TimeSlotGridProps {
  timeOfDay: TimeOfDay;
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
}

const generateTimeSlots = (timeOfDay: TimeOfDay): string[] => {
  const slots: string[] = [];
  let startHour: number;
  let endHour: number;

  switch (timeOfDay) {
    case "morning":
      startHour = 7;
      endHour = 12;
      break;
    case "afternoon":
      startHour = 12;
      endHour = 17;
      break;
    case "evening":
      startHour = 17;
      endHour = 20;
      break;
  }

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 20) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const endMinute = minute + 20;
      const endHourAdjusted = endMinute >= 60 ? hour + 1 : hour;
      const endMinuteAdjusted = endMinute >= 60 ? endMinute - 60 : endMinute;
      const endTime = `${endHourAdjusted.toString().padStart(2, "0")}:${endMinuteAdjusted.toString().padStart(2, "0")}`;
      slots.push(`${startTime} - ${endTime}`);
    }
  }

  return slots;
};

export function TimeSlotGrid({
  timeOfDay,
  selectedSlot,
  onSlotSelect,
}: TimeSlotGridProps) {
  const slots = generateTimeSlots(timeOfDay);

  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSlotSelect(slot)}
          className={cn(
            "py-4 px-2 rounded-2xl text-sm font-medium transition-all duration-200",
            "border",
            selectedSlot === slot
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-accent/30"
          )}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}

export default TimeSlotGrid;
