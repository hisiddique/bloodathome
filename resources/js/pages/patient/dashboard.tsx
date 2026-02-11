import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, CreditCard, Heart } from 'lucide-react';

interface Booking {
    id: string;
    phlebotomist_name: string;
    phlebotomist_image: string | null;
    appointment_date: string;
    time_slot: string;
    address: string;
    status: string;
}

interface DashboardProps {
    upcomingBookings?: Booking[];
    recentActivity?: Array<{
        id: string;
        type: string;
        message: string;
        date: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function PatientDashboard({
    upcomingBookings = [],
    recentActivity = [],
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
                            <div className="text-2xl font-bold">0</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Saved Addresses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
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
                                            <img
                                                src={
                                                    booking.phlebotomist_image ||
                                                    '/placeholder.svg'
                                                }
                                                alt={booking.phlebotomist_name}
                                                className="size-12 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {booking.phlebotomist_name}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3" />
                                                        {format(
                                                            new Date(
                                                                booking.appointment_date,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {booking.time_slot}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="size-3" />
                                                        {booking.address}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-2"
                                                >
                                                    {booking.status}
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
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your recent account activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No recent activity
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="border-b pb-3 last:border-0"
                                        >
                                            <p className="text-sm">
                                                {activity.message}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {format(
                                                    new Date(activity.date),
                                                    'MMM d, yyyy h:mm a',
                                                )}
                                            </p>
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
