import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface Booking {
    id: string;
    patient_name: string;
    appointment_date: string;
    time_slot: string;
    address: string;
    status: string;
    service: string;
    price: number;
}

interface PaginatedBookings {
    data: Booking[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface ProviderBookingsIndexProps {
    bookings: PaginatedBookings;
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
    };
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
];

const statusColors: Record<string, string> = {
    pending: 'secondary',
    confirmed: 'default',
    completed: 'outline',
    cancelled: 'destructive',
};

export default function ProviderBookingsIndex({
    bookings,
    filters = {},
}: ProviderBookingsIndexProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        router.get(
            '/bookings',
            { status: value === 'all' ? undefined : value },
            { preserveState: true },
        );
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Bookings
                        </h2>
                        <p className="text-muted-foreground">
                            Manage your appointments
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bookings</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">
                                    Confirmed
                                </SelectItem>
                                <SelectItem value="completed">
                                    Completed
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Cancelled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    {bookings.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No bookings found
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.data.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">
                                                {booking.patient_name}
                                            </TableCell>
                                            <TableCell>
                                                {booking.service}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(
                                                        new Date(
                                                            booking.appointment_date,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {booking.time_slot}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {booking.address}
                                            </TableCell>
                                            <TableCell>
                                                £{booking.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        statusColors[
                                                            booking.status
                                                        ] as any
                                                    }
                                                >
                                                    {booking.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/bookings/${booking.id}`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {bookings.last_page > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-3">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(bookings.current_page - 1) * bookings.per_page + 1} to{' '}
                                        {Math.min(bookings.current_page * bookings.per_page, bookings.total)} of{' '}
                                        {bookings.total} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(bookings.links[0]?.url)}
                                            disabled={bookings.current_page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="text-sm">
                                            Page {bookings.current_page} of {bookings.last_page}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(bookings.links[bookings.links.length - 1]?.url)}
                                            disabled={bookings.current_page === bookings.last_page}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
