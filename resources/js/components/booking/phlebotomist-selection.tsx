import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { BookingHeader } from "./header";
import { ConfirmButton } from "./confirm-button";
import { ChatButton } from "./chat-button";
import { PhlebotomistCard, type Phlebotomist } from "@/components/phlebotomist/card";

// Mock phlebotomists data - 5 closest
const mockPhlebotomists: Phlebotomist[] = [
  {
    id: "1",
    name: "Dr. Adeel Khan",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    distance: "2.4 miles",
    price: 60,
    available: true,
    experience: "8 years",
  },
  {
    id: "2",
    name: "Sarah Mitchell",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    distance: "3.1 miles",
    price: 55,
    available: true,
    experience: "5 years",
  },
  {
    id: "3",
    name: "James Wilson",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    distance: "4.8 miles",
    price: 50,
    available: false,
    experience: "6 years",
  },
  {
    id: "4",
    name: "Dr. Emily Chen",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    distance: "5.2 miles",
    price: 65,
    available: true,
    experience: "10 years",
  },
  {
    id: "5",
    name: "Michael Roberts",
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
    rating: 4.6,
    distance: "6.0 miles",
    price: 45,
    available: true,
    experience: "4 years",
  },
];

interface PhlebotomistSelectionProps {
  date: Date;
  timeSlot: string;
  onContinue: (phlebotomist: Phlebotomist) => void;
  onBack: () => void;
}

export function PhlebotomistSelection({
  date,
  timeSlot,
  onContinue,
  onBack,
}: PhlebotomistSelectionProps) {
  const [selectedPhlebotomist, setSelectedPhlebotomist] =
    useState<Phlebotomist | null>(null);

  const handleViewProfile = (phlebotomist: Phlebotomist) => {
    toast.info(phlebotomist.name, {
      description: `${phlebotomist.experience} experience - Rating: ${phlebotomist.rating}/5`,
    });
  };

  const handleContinue = () => {
    if (selectedPhlebotomist) {
      onContinue(selectedPhlebotomist);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4">
        <BookingHeader title="Choose a Phlebotomist" onBack={onBack} />
      </div>

      <div className="px-4 space-y-4">
        {/* Selected Date/Time Summary */}
        <div className="bg-accent/50 rounded-2xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Your appointment</p>
          <p className="text-foreground font-medium">
            {format(date, "EEEE, MMMM d, yyyy")} at {timeSlot}
          </p>
        </div>

        {/* Phlebotomist List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {mockPhlebotomists.length} phlebotomists nearby
          </h2>

          {mockPhlebotomists.map((phlebotomist) => (
            <PhlebotomistCard
              key={phlebotomist.id}
              phlebotomist={phlebotomist}
              isSelected={selectedPhlebotomist?.id === phlebotomist.id}
              onSelect={() => setSelectedPhlebotomist(phlebotomist)}
              onViewProfile={() => handleViewProfile(phlebotomist)}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <ConfirmButton onClick={handleContinue} disabled={!selectedPhlebotomist}>
          Continue with {selectedPhlebotomist?.name || "selection"}
        </ConfirmButton>
      </div>

      <ChatButton />
    </div>
  );
}

export default PhlebotomistSelection;
