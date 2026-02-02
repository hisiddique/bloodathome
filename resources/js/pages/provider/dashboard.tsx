import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ProviderLayout from '@/layouts/provider-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Clock, DollarSign, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
    id: string;
    patient_name: string;
    appointment_date: string;
    time_slot: string;
    address: string;
    status: string;
    service: string;
}

interface DashboardStats {
    today_bookings: number;
    pending_bookings: number;
    completed_this_month: number;
    earnings_this_month: number;
    average_rating: number;
    total_reviews: number;
}

interface ProviderDashboardProps {
    stats: DashboardStats;
    upcoming_bookings: Booking[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/provider/dashboard',
    },
];

export default function ProviderDashboard({
    stats,
    upcoming_bookings = [],
}: ProviderDashboardProps) {
    return (
        <ProviderLayout breadcrumbs={breadcrumbs}>
            <Head title="Provider Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Today's Bookings
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.today_bookings || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Scheduled today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Bookings
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.pending_bookings || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting response
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.completed_this_month || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                £{stats?.earnings_this_month?.toFixed(2) || '0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Rating
                            </CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold">
                                    {stats?.average_rating?.toFixed(1) || '0.0'}
                                </div>
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.total_reviews || 0} reviews
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Upcoming Bookings</CardTitle>
                            <CardDescription>
                                Your scheduled appointments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcoming_bookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        No upcoming bookings
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcoming_bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center gap-4 rounded-lg border p-4"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">
                                                        {booking.patient_name}
                                                    </h4>
                                                    <Badge
                                                        variant={
                                                            booking.status ===
                                                            'confirmed'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.service}
                                                </p>
                                                <div className="mt-2 flex items-center gap-4 text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(
                                                            new Date(
                                                                booking.appointment_date,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {booking.time_slot}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/provider/bookings/${booking.id}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Manage your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Link
                                href="/provider/availability"
                                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                                <Clock className="h-8 w-8 text-primary" />
                                <div>
                                    <h4 className="font-semibold">
                                        Update Availability
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your schedule
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/provider/services"
                                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                                <TrendingUp className="h-8 w-8 text-primary" />
                                <div>
                                    <h4 className="font-semibold">
                                        Manage Services
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Update pricing & services
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/provider/service-areas"
                                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                                <Calendar className="h-8 w-8 text-primary" />
                                <div>
                                    <h4 className="font-semibold">
                                        Service Areas
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Update coverage areas
                                    </p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProviderLayout>
    );
}
