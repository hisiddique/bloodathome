import { useState } from "react";
import { format } from "date-fns";
import { router } from "@inertiajs/react";
import { CheckCircle2, Calendar, Clock, MessageCircle } from "lucide-react";
import { ConfirmButton } from "./confirm-button";
import { BookingChat } from "./chat";
import { type Phlebotomist } from "@/components/phlebotomist/card";

interface BookingSuccessProps {
  date: Date;
  timeSlot: string;
  bookingId?: string | null;
  phlebotomist?: Phlebotomist;
  onDone?: () => void;
}

export function BookingSuccess({
  date,
  timeSlot,
  bookingId,
  phlebotomist,
  onDone,
}: BookingSuccessProps) {
  const [showChat, setShowChat] = useState(false);

  const handleDone = () => {
    if (onDone) {
      onDone();
    } else {
      router.visit("/");
    }
  };

  return (
    <>
      <div className="flex flex-col h-full items-center justify-center px-6 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          Booking Confirmed!
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          Your appointment has been scheduled successfully. We'll send you a
          reminder before your visit.
        </p>

        <div className="bg-card rounded-3xl p-6 w-full border border-border mb-8">
          {phlebotomist && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <img
                src={phlebotomist.image}
                alt={phlebotomist.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-foreground">
                  {phlebotomist.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your Phlebotomist
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">
                {format(date, "EEE, MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{timeSlot}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Blood draw appointment at your home
          </div>
        </div>

        <div className="w-full space-y-3">
          {bookingId && phlebotomist && (
            <button
              onClick={() => setShowChat(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary/10 text-primary rounded-2xl font-semibold hover:bg-primary/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with {phlebotomist.name}
            </button>
          )}
          <ConfirmButton onClick={handleDone}>Done</ConfirmButton>
        </div>
      </div>

      {showChat && bookingId && phlebotomist && (
        <BookingChat
          bookingId={bookingId}
          phlebotomistName={phlebotomist.name}
          phlebotomistImage={phlebotomist.image}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}

export default BookingSuccess;
