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
import ProviderLayout from '@/layouts/provider-layout';
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
import { format } from 'date-fns';

interface Booking {
    id: string;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    appointment_date: string;
    time_slot: string;
    address: string;
    postcode: string;
    status: string;
    service: string;
    price: number;
    notes?: string;
    created_at: string;
}

interface ProviderBookingShowProps {
    booking: Booking;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/provider/dashboard',
    },
    {
        title: 'Bookings',
        href: '/provider/bookings',
    },
    {
        title: 'Booking Details',
        href: '#',
    },
];

export default function ProviderBookingShow({
    booking,
}: ProviderBookingShowProps) {
    const handleAccept = () => {
        router.post(
            `/provider/bookings/${booking.id}/accept`,
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
            `/provider/bookings/${booking.id}/decline`,
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
            `/provider/bookings/${booking.id}/complete`,
            {},
            {
                onSuccess: () => {
                    // Handle success
                },
            },
        );
    };

    return (
        <ProviderLayout breadcrumbs={breadcrumbs}>
            <Head title={`Booking - ${booking.patient_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Booking Details
                        </h2>
                        <p className="text-muted-foreground">
                            Booking ID: {booking.id}
                        </p>
                    </div>
                    <Badge
                        variant={
                            booking.status === 'confirmed'
                                ? 'default'
                                : booking.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                        }
                        className="text-sm"
                    >
                        {booking.status}
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
                                        {booking.patient_name}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Service
                                    </h4>
                                    <p className="font-semibold">
                                        {booking.service}
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
                                            {format(
                                                new Date(
                                                    booking.appointment_date,
                                                ),
                                                'EEEE, MMMM d, yyyy',
                                            )}
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
                                            {booking.time_slot}
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
                                        {booking.address}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {booking.postcode}
                                    </p>
                                </div>
                            </div>

                            {booking.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                            Special Notes
                                        </h4>
                                        <p className="text-sm">
                                            {booking.notes}
                                        </p>
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
                                            {booking.patient_email}
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
                                            {booking.patient_phone}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Service Fee
                                    </span>
                                    <span className="text-2xl font-bold">
                                        £{booking.price.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {booking.status === 'pending' && (
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

                        {booking.status === 'confirmed' && (
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
        </ProviderLayout>
    );
}
