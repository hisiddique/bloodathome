import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    Phone,
    XCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BookingStatus {
    id: number;
    name: string;
    description?: string;
}

interface BookingItem {
    id: string;
    service?: {
        id: string;
        name: string;
        category?: { id: string; name: string } | null;
    } | null;
}

interface Booking {
    id: string;
    confirmation_number: string | null;
    scheduled_date: string | null;
    time_slot: string | null;
    service_address_line1: string | null;
    service_address_line2: string | null;
    service_town_city: string | null;
    service_postcode: string | null;
    subtotal_amount: string | number;
    service_fee_percent: string | number;
    service_fee_amount: string | number;
    vat_percent: string | number;
    vat_amount: string | number;
    discount_amount: string | number;
    grand_total_cost: string | number;
    patient_notes: string | null;
    visit_instructions: string | null;
    created_at: string;
    status: BookingStatus | null;
    user: {
        full_name: string;
        email: string;
        phone?: string | null;
    } | null;
    items: BookingItem[];
}

interface ProviderBookingShowProps {
    booking: Booking;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Bookings',
        href: '/bookings',
    },
    {
        title: 'Booking Details',
        href: '#',
    },
];

function formatAddress(booking: Booking): string {
    return [
        booking.service_address_line1,
        booking.service_address_line2,
        booking.service_town_city,
    ]
        .filter(Boolean)
        .join(', ');
}

function getServiceNames(booking: Booking): string {
    if (!booking.items?.length) {
        return '—';
    }
    return booking.items
        .map((item) => item.service?.name ?? '—')
        .filter(Boolean)
        .join(', ');
}

export default function ProviderBookingShow({
    booking,
}: ProviderBookingShowProps) {
    const statusName = booking.status?.name ?? '—';
    const subtotalAmount = Number(booking.subtotal_amount ?? 0);
    const serviceFeePercent = Number(booking.service_fee_percent ?? 0);
    const serviceFeeAmount = Number(booking.service_fee_amount ?? 0);
    const vatPercent = Number(booking.vat_percent ?? 0);
    const vatAmount = Number(booking.vat_amount ?? 0);
    const discountAmount = Number(booking.discount_amount ?? 0);
    const price = Number(booking.grand_total_cost ?? 0);

    const handleAccept = () => {
        router.post(
            `/bookings/${booking.id}/accept`,
            {},
            {
                onSuccess: () => {
                    // Handle success
                },
            },
        );
    };

    const handleDecline = () => {
        router.post(
            `/bookings/${booking.id}/decline`,
            {},
            {
                onSuccess: () => {
                    // Handle success
                },
            },
        );
    };

    const handleComplete = () => {
        router.post(
            `/bookings/${booking.id}/complete`,
            {},
            {
                onSuccess: () => {
                    // Handle success
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Booking - ${booking.user?.full_name ?? 'Unknown'}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Booking Details
                        </h2>
                        <p className="text-muted-foreground">
                            Ref: {booking.confirmation_number ?? booking.id}
                        </p>
                    </div>
                    <Badge
                        variant={
                            statusName === 'Confirmed' || statusName === 'confirmed'
                                ? 'default'
                                : statusName === 'Pending' || statusName === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                        }
                        className="text-sm"
                    >
                        {statusName}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Appointment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Patient Name
                                    </h4>
                                    <p className="font-semibold">
                                        {booking.user?.full_name ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Service
                                    </h4>
                                    <p className="font-semibold">
                                        {getServiceNames(booking)}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Date
                                        </h4>
                                        <p className="font-semibold">
                                            {booking.scheduled_date
                                                ? format(
                                                      parseISO(booking.scheduled_date),
                                                      'EEEE, MMMM d, yyyy',
                                                  )
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Time
                                        </h4>
                                        <p className="font-semibold">
                                            {booking.time_slot ?? '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-2">
                                <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Address
                                    </h4>
                                    <p className="font-semibold">
                                        {formatAddress(booking) || '—'}
                                    </p>
                                    {booking.service_postcode && (
                                        <p className="text-sm text-muted-foreground">
                                            {booking.service_postcode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {(booking.patient_notes || booking.visit_instructions) && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                            Special Notes
                                        </h4>
                                        {booking.patient_notes && (
                                            <p className="text-sm">
                                                {booking.patient_notes}
                                            </p>
                                        )}
                                        {booking.visit_instructions && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Visit instructions: {booking.visit_instructions}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Email
                                        </h4>
                                        <p className="text-sm">
                                            {booking.user?.email ?? '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Phone
                                        </h4>
                                        <p className="text-sm">
                                            {booking.user?.phone ?? '—'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>£{subtotalAmount.toFixed(2)}</span>
                                </div>
                                {serviceFeeAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Service Fee ({serviceFeePercent}%)
                                        </span>
                                        <span>£{serviceFeeAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {vatAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            VAT ({vatPercent}%)
                                        </span>
                                        <span>£{vatAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-600 dark:text-green-400">Discount</span>
                                        <span className="text-green-600 dark:text-green-400">
                                            -£{discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex items-center justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-xl">£{price.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {(statusName === 'Pending' || statusName === 'pending') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                    <CardDescription>
                                        Respond to this booking
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        className="w-full"
                                        onClick={handleAccept}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Accept Booking
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={handleDecline}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Decline Booking
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {(statusName === 'Confirmed' || statusName === 'confirmed') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                    <CardDescription>
                                        Mark appointment status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full"
                                        onClick={handleComplete}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Completed
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
