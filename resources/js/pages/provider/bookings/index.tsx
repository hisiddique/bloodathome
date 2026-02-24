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
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

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
    };
}

interface Booking {
    id: string;
    confirmation_number: string | null;
    scheduled_date: string;
    time_slot: string | null;
    service_address_line1: string | null;
    service_address_line2: string | null;
    service_town_city: string | null;
    service_postcode: string | null;
    grand_total_cost: string | number;
    status: BookingStatus | null;
    user: {
        full_name: string;
        email: string;
        phone?: string | null;
    } | null;
    items: BookingItem[];
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
    Pending: 'secondary',
    pending: 'secondary',
    Confirmed: 'default',
    confirmed: 'default',
    Completed: 'outline',
    completed: 'outline',
    Cancelled: 'destructive',
    cancelled: 'destructive',
};

function formatAddress(booking: Booking): string {
    return [
        booking.service_address_line1,
        booking.service_address_line2,
        booking.service_town_city,
        booking.service_postcode,
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
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Confirmed">
                                    Confirmed
                                </SelectItem>
                                <SelectItem value="Completed">
                                    Completed
                                </SelectItem>
                                <SelectItem value="Cancelled">
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
                                    {bookings.data.map((booking) => {
                                        const statusName = booking.status?.name ?? '—';
                                        const price = Number(booking.grand_total_cost ?? 0);

                                        return (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">
                                                    {booking.user?.full_name ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {getServiceNames(booking)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {booking.scheduled_date
                                                            ? format(
                                                                  parseISO(booking.scheduled_date),
                                                                  'MMM d, yyyy',
                                                              )
                                                            : '—'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {booking.time_slot ?? '—'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {formatAddress(booking) || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    £{price.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            statusColors[statusName] as any
                                                        }
                                                    >
                                                        {statusName}
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
                                        );
                                    })}
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
