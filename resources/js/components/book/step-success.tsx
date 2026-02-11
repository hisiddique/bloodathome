import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Check, Mail, ArrowRight, Home, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/booking-context';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';

const CONFETTI_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];

interface ConfettiPiece {
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
    isCircle: boolean;
}

function generateConfetti(count: number): ConfettiPiece[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + Math.random() * 7,
        isCircle: Math.random() > 0.5,
    }));
}

function Confetti() {
    const pieces = useMemo(() => generateConfetti(50), []);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden="true">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: `${piece.x}%`,
                        top: '-12px',
                        width: piece.size,
                        height: piece.isCircle ? piece.size : piece.size * 0.6,
                        backgroundColor: piece.color,
                        borderRadius: piece.isCircle ? '50%' : '2px',
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

function AnimatedCheckmark() {
    return (
        <div className="relative w-28 h-28">
            {/* Pulsing glow */}
            <div className="absolute inset-[-8px] rounded-full bg-green-500/20 dark:bg-green-400/15 animate-success-glow" />

            {/* SVG checkmark */}
            <svg className="w-28 h-28 relative z-10" viewBox="0 0 52 52">
                <circle
                    className="animate-checkmark-circle"
                    cx="26"
                    cy="26"
                    r="24"
                    fill="none"
                    strokeWidth="2"
                />
                <path
                    className="animate-checkmark-check"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
            </svg>
        </div>
    );
}

export function StepSuccess() {
    const {
        selectedProvider,
        selectedDate,
        selectedSlot,
        location,
        bookedServices,
        selectedServices,
        providerServicePrices,
        confirmationNumber,
        totalAmount,
        clearBooking,
    } = useBooking();

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleNavigate = (path: string) => {
        clearBooking();
        router.visit(path);
    };

    const services = bookedServices.length > 0 ? bookedServices : selectedServices;

    const totalPaid = useMemo(() => {
        if (totalAmount > 0) return totalAmount;
        return services.reduce((sum, s) => sum + (providerServicePrices[s.id] || 0), 0);
    }, [services, providerServicePrices, totalAmount]);

    return (
        <div className="relative max-w-2xl mx-auto py-4">
            {showConfetti && <Confetti />}

            {/* Animated Checkmark */}
            <div className="flex justify-center mb-6">
                <AnimatedCheckmark />
            </div>

            {/* Title */}
            <div className="text-center mb-8 animate-in fade-in duration-500" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
                <p className="text-lg text-muted-foreground">Your appointment has been successfully booked</p>
                {confirmationNumber && (
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full">
                        <span className="text-sm text-green-700 dark:text-green-300">Confirmation</span>
                        <span className="font-mono font-bold text-green-800 dark:text-green-200">{confirmationNumber}</span>
                    </div>
                )}
            </div>

            {/* Appointment Details Card */}
            <div
                className="bg-card border border-border rounded-2xl overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
            >
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Appointment Details</h2>

                    {/* Provider */}
                    {selectedProvider && (
                        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
                            {selectedProvider.user?.profile_image ? (
                                <img
                                    src={selectedProvider.user.profile_image}
                                    alt={selectedProvider.user?.full_name || 'Provider'}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-primary">
                                        {(selectedProvider.user?.full_name || selectedProvider.name || 'P').charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-foreground">
                                    {selectedProvider.user?.full_name || selectedProvider.name}
                                </p>
                                {selectedProvider.type && (
                                    <p className="text-sm text-muted-foreground">{selectedProvider.type.name}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Date, Time, Location */}
                    <div className="space-y-3 mb-5 pb-5 border-b border-border">
                        {selectedDate && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                    <p className="font-medium text-foreground">
                                        {format(selectedDate, 'EEEE, d MMMM yyyy')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedSlot && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Time</p>
                                    <p className="font-medium text-foreground">{selectedSlot.time}</p>
                                </div>
                            </div>
                        )}

                        {location && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="font-medium text-foreground">{location.address || location.postcode}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Services */}
                    {services.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-3">Services Booked</p>
                            <div className="space-y-2">
                                {services.map((service) => (
                                    <div key={service.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-foreground">{service.service_name}</span>
                                        </div>
                                        {providerServicePrices[service.id] !== undefined && (
                                            <span className="text-sm font-medium text-foreground">
                                                £{providerServicePrices[service.id].toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {totalPaid > 0 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                    <span className="font-semibold text-foreground">Total Paid</span>
                                    <span className="text-lg font-bold text-primary">£{totalPaid.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* What's Next */}
            <div
                className="bg-accent/30 border border-border rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: '1.1s', animationFillMode: 'both' }}
            >
                <h3 className="font-semibold text-foreground mb-3">What's Next</h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            A confirmation email has been sent with your appointment details
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Your provider will confirm the appointment shortly</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <CalendarPlus className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">You can manage this appointment from your dashboard</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in duration-500" style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
                <Button onClick={() => handleNavigate('/bookings')} size="lg" className="flex-1 py-6 text-base">
                    View My Bookings
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                    onClick={() => handleNavigate('/book')}
                    variant="outline"
                    size="lg"
                    className="flex-1 py-6 text-base"
                >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Book Another
                </Button>
                <Button
                    onClick={() => handleNavigate('/')}
                    variant="ghost"
                    size="lg"
                    className="sm:flex-initial px-6 py-6 text-base"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                </Button>
            </div>
        </div>
    );
}
