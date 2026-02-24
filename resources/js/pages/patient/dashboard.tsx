import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, CreditCard, Heart, MapPin } from 'lucide-react';

interface BookingStatus {
    id: number;
    name: string;
}

interface BookingProvider {
    id: string;
    user?: {
        full_name?: string;
        profile_photo_url?: string | null;
    };
}

interface Booking {
    id: string;
    scheduled_date: string;
    time_slot: string | null;
    service_address_line1: string | null;
    service_address_line2: string | null;
    service_town_city: string | null;
    service_postcode: string | null;
    status: BookingStatus | null;
    provider: BookingProvider | null;
}

interface RecentBooking {
    id: string;
    scheduled_date: string;
    status: BookingStatus | null;
    provider: BookingProvider | null;
}

interface PendingReview {
    id: string;
    scheduled_date: string;
    provider: BookingProvider | null;
}

interface DashboardProps {
    upcomingBookings?: Booking[];
    recentBookings?: RecentBooking[];
    pendingReviews?: PendingReview[];
    totalBookings?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function formatBookingAddress(booking: Booking): string {
    const parts = [
        booking.service_address_line1,
        booking.service_address_line2,
        booking.service_town_city,
        booking.service_postcode,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Address not provided';
}

function formatScheduledDate(dateString: string | null | undefined): string {
    if (!dateString) {
        return 'Date not set';
    }

    try {
        // scheduled_date is cast as 'date' in Laravel, so it arrives as a date string (YYYY-MM-DD)
        const date = parseISO(dateString);
        return format(date, 'MMM d, yyyy');
    } catch {
        return 'Invalid date';
    }
}

export default function PatientDashboard({
    upcomingBookings = [],
    recentBookings = [],
    pendingReviews = [],
    totalBookings = 0,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back!</h1>
                    <p className="text-muted-foreground">
                        Manage your appointments and health information
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Upcoming Appointments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {upcomingBookings.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Total Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalBookings}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Pending Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingReviews.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>
                                Your scheduled blood test appointments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Calendar className="mb-2 size-12 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No upcoming appointments
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-start gap-3 rounded-lg border p-3"
                                        >
                                            <UserAvatar
                                                name={
                                                    booking.provider?.user?.full_name ||
                                                    'Provider'
                                                }
                                                imageUrl={
                                                    booking.provider?.user?.profile_photo_url
                                                }
                                                className="size-12"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {booking.provider?.user?.full_name ||
                                                        'Provider not assigned'}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3" />
                                                        {formatScheduledDate(
                                                            booking.scheduled_date,
                                                        )}
                                                    </span>
                                                    {booking.time_slot && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {booking.time_slot}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="size-3" />
                                                        {formatBookingAddress(booking)}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-2"
                                                >
                                                    {booking.status?.name ?? 'Unknown'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    <Link
                                        href="/bookings"
                                        className="block text-center text-sm text-primary hover:underline"
                                    >
                                        View all bookings
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Bookings</CardTitle>
                            <CardDescription>
                                Your recently completed appointments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No recent bookings
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="border-b pb-3 last:border-0"
                                        >
                                            <p className="text-sm font-medium">
                                                {booking.provider?.user?.full_name ||
                                                    'Provider not assigned'}
                                            </p>
                                            <div className="mt-1 flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">
                                                    {formatScheduledDate(booking.scheduled_date)}
                                                </p>
                                                <Badge variant="secondary">
                                                    {booking.status?.name ?? 'Unknown'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/medical-info">
                        <Card className="cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="size-5" />
                                    Medical Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Update your medical history and conditions
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/addresses">
                        <Card className="cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="size-5" />
                                    Saved Addresses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Manage your saved addresses
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/payment-methods">
                        <Card className="cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="size-5" />
                                    Payment Methods
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Manage your payment methods
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
