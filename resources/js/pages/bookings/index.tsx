import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import { BookingHeader } from "@/components/booking/header";
import { ChatButton } from "@/components/booking/chat-button";
import { BookingChat } from "@/components/booking/chat";
import { Calendar, Clock, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Booking {
  id: string;
  phlebotomist_id: string;
  phlebotomist_name: string;
  phlebotomist_image: string | null;
  appointment_date: string;
  time_slot: string;
  address: string;
  status: string;
}

interface MyBookingsProps {
  bookings?: Booking[];
}

export default function MyBookings({ bookings = [] }: MyBookingsProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showChat, setShowChat] = useState(false);

  const openChat = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowChat(true);
  };

  return (
    <>
      <Head title="My Bookings" />

      <div className="min-h-screen bg-background">
        <div className="px-4">
          <BookingHeader title="My Bookings" onBack={() => router.visit("/")} />
        </div>

        <div className="px-4 pb-24">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <button
                onClick={() => router.visit("/booking")}
                className="text-primary hover:underline font-medium"
              >
                Book your first appointment
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phlebotomist</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={booking.phlebotomist_image || "/placeholder.svg"}
                                alt={booking.phlebotomist_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <span className="font-medium text-foreground">
                                {booking.phlebotomist_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(booking.appointment_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{booking.time_slot}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {booking.address}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "default"
                                  : booking.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                                  : ""
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => openChat(booking)}
                              className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4 text-primary" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-card border border-border rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={booking.phlebotomist_image || "/placeholder.svg"}
                        alt={booking.phlebotomist_name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {booking.phlebotomist_name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(booking.appointment_date), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.time_slot}
                          </span>
                        </div>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <button
                        onClick={() => openChat(booking)}
                        className="p-3 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {showChat && selectedBooking && (
          <BookingChat
            bookingId={selectedBooking.id}
            phlebotomistName={selectedBooking.phlebotomist_name}
            phlebotomistImage={selectedBooking.phlebotomist_image || undefined}
            onClose={() => setShowChat(false)}
          />
        )}

        <ChatButton />
      </div>
    </>
  );
}
