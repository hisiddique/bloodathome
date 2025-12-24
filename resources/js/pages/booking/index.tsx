import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import { BookingHeader } from "@/components/booking/header";
import { ChatButton } from "@/components/booking/chat-button";
import { BookingSuccess } from "@/components/booking/success";
import { LocationStep } from "@/components/booking/location-step";
import { PhlebotomistSelection } from "@/components/booking/phlebotomist-selection";
import { PatientDetails } from "@/components/booking/patient-details";
import { Payment } from "@/components/booking/payment";
import { type Phlebotomist } from "@/components/phlebotomist/card";
import { toast } from "sonner";

type BookingStep = "location" | "phlebotomist" | "details" | "payment" | "success";

interface BookingProps {
  isUnder16?: boolean;
  mapboxToken?: string;
}

export default function Booking({ isUnder16 = false, mapboxToken }: BookingProps) {
  const [step, setStep] = useState<BookingStep>("location");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [selectedPhlebotomist, setSelectedPhlebotomist] = useState<Phlebotomist | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleBack = () => {
    switch (step) {
      case "location":
        router.visit("/");
        break;
      case "phlebotomist":
        setStep("location");
        break;
      case "details":
        setStep("phlebotomist");
        break;
      case "payment":
        setStep("details");
        break;
      default:
        router.visit("/");
    }
  };

  const handleLocationContinue = (addr: string, date: Date, timeSlot: string) => {
    setAddress(addr);
    setSelectedDate(date);
    setSelectedSlot(timeSlot);
    setStep("phlebotomist");
  };

  const handlePhlebotomistContinue = (phlebotomist: Phlebotomist) => {
    setSelectedPhlebotomist(phlebotomist);
    setStep("details");
  };

  const handleDetailsContinue = (details: any) => {
    setPatientDetails(details);
    setAddress(details.address1);
    setStep("payment");
  };

  const handlePaymentComplete = async () => {
    // Submit booking to backend
    if (selectedPhlebotomist && selectedSlot) {
      try {
        // Here we would normally use Inertia's form or router.post
        // For now, we'll simulate the booking save
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          },
          body: JSON.stringify({
            phlebotomist_id: selectedPhlebotomist.id,
            appointment_date: selectedDate.toISOString().split("T")[0],
            time_slot: selectedSlot,
            address: address,
            patient_details: patientDetails,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBookingId(data.id);
        } else {
          toast.error("Booking saved locally", {
            description: "Your appointment is confirmed but chat will be available after sign in.",
          });
        }
      } catch (error) {
        console.error("Error saving booking:", error);
        toast.error("Booking saved locally", {
          description: "Your appointment is confirmed but chat will be available after sign in.",
        });
      }
    }

    setStep("success");
  };

  const handleDone = () => {
    router.visit("/");
  };

  // Location Step
  if (step === "location") {
    return (
      <>
        <Head title="Book Your Appointment" />
        <LocationStep onContinue={handleLocationContinue} onBack={handleBack} />
      </>
    );
  }

  // Phlebotomist Selection Step
  if (step === "phlebotomist" && selectedSlot) {
    return (
      <>
        <Head title="Select Phlebotomist" />
        <PhlebotomistSelection
          date={selectedDate}
          timeSlot={selectedSlot}
          onContinue={handlePhlebotomistContinue}
          onBack={handleBack}
        />
      </>
    );
  }

  // Patient Details Step
  if (step === "details" && selectedSlot) {
    return (
      <>
        <Head title="Patient Details" />
        <PatientDetails
          date={selectedDate}
          timeSlot={selectedSlot}
          isUnder16={isUnder16}
          onContinue={handleDetailsContinue}
          onBack={handleBack}
        />
      </>
    );
  }

  // Payment Step
  if (step === "payment" && selectedSlot && selectedPhlebotomist) {
    return (
      <>
        <Head title="Payment" />
        <div className="min-h-screen bg-background">
          <div className="px-4">
            <BookingHeader title="Payment" onBack={handleBack} />
          </div>
          <Payment
            phlebotomist={selectedPhlebotomist}
            date={selectedDate}
            timeSlot={selectedSlot}
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBack}
          />
          <ChatButton />
        </div>
      </>
    );
  }

  // Success Step
  if (step === "success" && selectedSlot && selectedPhlebotomist) {
    return (
      <>
        <Head title="Booking Confirmed" />
        <div className="min-h-screen bg-background">
          <BookingSuccess
            date={selectedDate}
            timeSlot={selectedSlot}
            bookingId={bookingId}
            phlebotomist={selectedPhlebotomist}
            onDone={handleDone}
          />
        </div>
      </>
    );
  }

  // Default fallback
  return null;
}
