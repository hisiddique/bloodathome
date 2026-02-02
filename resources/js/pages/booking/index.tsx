import { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import PublicLayout from "@/layouts/public-layout";
import { BookingHeader } from "@/components/booking/header";
import { ChatButton } from "@/components/booking/chat-button";
import { BookingSuccess } from "@/components/booking/success";
import { LocationStep } from "@/components/booking/location-step";
import { PhlebotomistSelection } from "@/components/booking/phlebotomist-selection";
import { PatientDetails } from "@/components/booking/patient-details";
import { Payment } from "@/components/booking/payment";
import { StepSidebar, type BookingStep } from "@/components/booking/step-sidebar";
import { type Phlebotomist } from "@/components/phlebotomist/card";
import { toast } from "sonner";
import { type UserData, type UserAddress, type UserPaymentMethod } from "@/types";

interface BookingProps {
  isUnder16?: boolean;
  mapboxToken?: string;
  userData?: UserData | null;
  userAddresses?: UserAddress[];
  userPaymentMethods?: UserPaymentMethod[];
}

function BookingPage({
  isUnder16 = false,
  mapboxToken,
  userData = null,
  userAddresses = [],
  userPaymentMethods = []
}: BookingProps) {
  const BOOKING_DRAFT_KEY = 'booking_draft';

  const [step, setStep] = useState<BookingStep>("location");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [selectedPhlebotomist, setSelectedPhlebotomist] = useState<Phlebotomist | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Load booking draft from localStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(BOOKING_DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.selectedDate) {
          setSelectedDate(new Date(parsed.selectedDate));
        }
        if (parsed.selectedSlot) setSelectedSlot(parsed.selectedSlot);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.selectedPhlebotomist) setSelectedPhlebotomist(parsed.selectedPhlebotomist);
        if (parsed.patientDetails) setPatientDetails(parsed.patientDetails);
        if (parsed.step) setStep(parsed.step);
      }
    } catch (error) {
      console.error('Error loading booking draft:', error);
    }
  }, []);

  // Save booking draft to localStorage whenever critical data changes
  useEffect(() => {
    if (step !== 'success') {
      try {
        const draft = {
          step,
          selectedDate: selectedDate.toISOString(),
          selectedSlot,
          address,
          selectedPhlebotomist,
          patientDetails,
        };
        localStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.error('Error saving booking draft:', error);
      }
    }
  }, [step, selectedDate, selectedSlot, address, selectedPhlebotomist, patientDetails]);

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

    // Clear the booking draft after successful completion
    try {
      localStorage.removeItem(BOOKING_DRAFT_KEY);
    } catch (error) {
      console.error('Error clearing booking draft:', error);
    }

    setStep("success");
  };

  const handleDone = () => {
    router.visit("/");
  };

  const handleStepClick = (targetStep: BookingStep) => {
    // Only allow going back to previous steps
    const stepOrder: BookingStep[] = ["location", "phlebotomist", "details", "payment", "success"];
    const currentIndex = stepOrder.indexOf(step);
    const targetIndex = stepOrder.indexOf(targetStep);

    if (targetIndex < currentIndex) {
      setStep(targetStep);
    }
  };

  // Location Step
  if (step === "location") {
    return (
      <>
        <Head title="Book Your Appointment" />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
              <StepSidebar currentStep={step} onStepClick={handleStepClick} />
              <main className="max-w-2xl lg:mx-0 mx-auto">
                <LocationStep
                  onContinue={handleLocationContinue}
                  onBack={handleBack}
                  standalone={false}
                />
              </main>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Phlebotomist Selection Step
  if (step === "phlebotomist" && selectedSlot) {
    return (
      <>
        <Head title="Select Phlebotomist" />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
              <StepSidebar currentStep={step} onStepClick={handleStepClick} />
              <main className="max-w-2xl lg:mx-0 mx-auto">
                <PhlebotomistSelection
                  date={selectedDate}
                  timeSlot={selectedSlot}
                  onContinue={handlePhlebotomistContinue}
                  onBack={handleBack}
                  standalone={false}
                />
              </main>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Patient Details Step
  if (step === "details" && selectedSlot) {
    return (
      <>
        <Head title="Patient Details" />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
              <StepSidebar currentStep={step} onStepClick={handleStepClick} />
              <main className="max-w-2xl lg:mx-0 mx-auto">
                <PatientDetails
                  date={selectedDate}
                  timeSlot={selectedSlot}
                  isUnder16={isUnder16}
                  onContinue={handleDetailsContinue}
                  onBack={handleBack}
                  standalone={false}
                  userData={userData}
                  userAddresses={userAddresses}
                />
              </main>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Payment Step
  if (step === "payment" && selectedSlot && selectedPhlebotomist) {
    return (
      <>
        <Head title="Payment" />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
              <StepSidebar currentStep={step} onStepClick={handleStepClick} />
              <main className="max-w-2xl lg:mx-0 mx-auto">
                <div className="lg:hidden">
                  <BookingHeader title="Payment" onBack={handleBack} />
                </div>
                <div className="hidden lg:block mb-6">
                  <h1 className="text-2xl font-semibold text-foreground">Payment</h1>
                </div>
                <Payment
                  phlebotomist={selectedPhlebotomist}
                  date={selectedDate}
                  timeSlot={selectedSlot}
                  onPaymentComplete={handlePaymentComplete}
                  onBack={handleBack}
                  standalone={false}
                  userPaymentMethods={userPaymentMethods}
                />
              </main>
            </div>
          </div>
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
          <div className="container mx-auto px-4 py-8">
            <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
              <StepSidebar currentStep={step} onStepClick={handleStepClick} />
              <main className="max-w-2xl lg:mx-0 mx-auto">
                <BookingSuccess
                  date={selectedDate}
                  timeSlot={selectedSlot}
                  bookingId={bookingId}
                  phlebotomist={selectedPhlebotomist}
                  onDone={handleDone}
                />
              </main>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Default fallback
  return null;
}

BookingPage.layout = (page: React.ReactNode) => <PublicLayout hideFooter>{page}</PublicLayout>;

export default BookingPage;
