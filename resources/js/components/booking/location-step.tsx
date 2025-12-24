import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { BookingHeader } from "./header";
import { AddressInput } from "./address-input";
import { LocationMap } from "./location-map";
import { DateSelector } from "./date-selector";
import { TimeOfDaySelector, type TimeOfDay } from "./time-of-day-selector";
import { TimeSlotGrid } from "./time-slot-grid";
import { ConfirmButton } from "./confirm-button";
import { ChatButton } from "./chat-button";

interface LocationStepProps {
  onContinue: (address: string, date: Date, timeSlot: string) => void;
  onBack: () => void;
}

export function LocationStep({ onContinue, onBack }: LocationStepProps) {
  const { mapboxToken } = usePage<{ mapboxToken?: string }>().props;
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    -1.1581, 52.9548,
  ]); // Nottingham default
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleUseLocation = () => {
    setIsLocating(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
          setAddress("Current Location");
          setIsLocating(false);
          toast.success("Location found", {
            description: "Finding phlebotomists near you",
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
          toast.error("Location access denied", {
            description: "Please enter your address manually",
          });
        }
      );
    } else {
      setIsLocating(false);
      toast.error("Location not supported", {
        description: "Please enter your address manually",
      });
    }
  };

  const handleContinue = () => {
    if (address && selectedSlot) {
      onContinue(address, selectedDate, selectedSlot);
    }
  };

  const markers = [
    {
      id: "user",
      coordinates: userLocation,
      label: "Your location",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4">
        <BookingHeader title="Book Your Appointment" onBack={onBack} />
      </div>

      <div className="px-4 space-y-6">
        <LocationMap
          center={userLocation}
          zoom={13}
          markers={markers}
          mapboxToken={mapboxToken || ""}
        />

        <AddressInput
          value={address}
          onChange={setAddress}
          onUseLocation={handleUseLocation}
          isLocating={isLocating}
        />

        {/* Date Selection */}
        <div className="space-y-3">
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Time of Day Selection */}
        <TimeOfDaySelector selected={timeOfDay} onSelect={setTimeOfDay} />

        {/* Time Slots */}
        <TimeSlotGrid
          timeOfDay={timeOfDay}
          selectedSlot={selectedSlot}
          onSlotSelect={setSelectedSlot}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <ConfirmButton
          onClick={handleContinue}
          disabled={!address || !selectedSlot}
        >
          Continue
        </ConfirmButton>
      </div>

      <ChatButton />
    </div>
  );
}

export default LocationStep;
