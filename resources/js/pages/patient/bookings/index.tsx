import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import PatientLayout from '@/layouts/patient-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Booking {
    id: string;
    phlebotomist_id: string;
    phlebotomist_name: string;
    phlebotomist_image: string | null;
    appointment_date: string;
    time_slot: string;
    address: string;
    status: string;
    total_amount: number;
}

interface PaginatedBookings {
    data: Booking[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface BookingsProps {
    bookings?: PaginatedBookings;
    filters?: {
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Bookings',
        href: '/patient/bookings',
    },
];

export default function Bookings({ bookings, filters = {} }: BookingsProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const bookingData = bookings?.data || [];
    const hasBookings = bookingData.length > 0;

    const handleFilter = () => {
        router.get(
            '/patient/bookings',
            {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true },
        );
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'completed':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <PatientLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Bookings</h1>
                        <p className="text-muted-foreground">
                            View and manage your appointments
                        </p>
                    </div>
                    <Link href="/booking">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            New Booking
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Bookings</CardTitle>
                        <CardDescription>
                            Filter your bookings by status and date range
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
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

                            <div className="grid gap-2">
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full">
                                    <Search className="mr-2 size-4" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {!hasBookings ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="mb-4 size-16 text-muted-foreground" />
                            <CardTitle className="mb-2">
                                No bookings found
                            </CardTitle>
                            <CardDescription className="mb-4">
                                {statusFilter !== 'all' || dateFrom || dateTo
                                    ? 'Try adjusting your filters'
                                    : 'Book your first appointment to get started'}
                            </CardDescription>
                            <Link href="/booking">
                                <Button>
                                    <Plus className="mr-2 size-4" />
                                    Book Appointment
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="hidden lg:block">
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Phlebotomist</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookingData.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={
                                                                booking.phlebotomist_image ||
                                                                '/placeholder.svg'
                                                            }
                                                            alt={
                                                                booking.phlebotomist_name
                                                            }
                                                            className="size-10 rounded-full object-cover"
                                                        />
                                                        <span className="font-medium">
                                                            {
                                                                booking.phlebotomist_name
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {format(
                                                        new Date(
                                                            booking.appointment_date,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {booking.time_slot}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {booking.address}
                                                </TableCell>
                                                <TableCell>
                                                    £{booking.total_amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusBadgeVariant(
                                                            booking.status,
                                                        )}
                                                    >
                                                        {booking.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/patient/bookings/${booking.id}`}
                                                    >
                                                        <Button
                                                            variant="outline"
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

                                {bookings && bookings.last_page > 1 && (
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
                            </Card>
                        </div>

                        <div className="space-y-4 lg:hidden">
                            {bookingData.map((booking) => (
                                <Card key={booking.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={
                                                    booking.phlebotomist_image ||
                                                    '/placeholder.svg'
                                                }
                                                alt={booking.phlebotomist_name}
                                                className="size-14 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold">
                                                    {booking.phlebotomist_name}
                                                </h3>
                                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="size-4" />
                                                        {format(
                                                            new Date(
                                                                booking.appointment_date,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="size-4" />
                                                        {booking.time_slot}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="size-4" />
                                                        {booking.address}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <Badge
                                                        variant={getStatusBadgeVariant(
                                                            booking.status,
                                                        )}
                                                    >
                                                        {booking.status}
                                                    </Badge>
                                                    <span className="font-semibold">
                                                        £{booking.total_amount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/patient/bookings/${booking.id}`}
                                                    className="mt-3 block"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {bookings && bookings.last_page > 1 && (
                                <Card>
                                    <CardContent className="flex items-center justify-between py-3">
                                        <div className="text-sm text-muted-foreground">
                                            Page {bookings.current_page} of {bookings.last_page}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(bookings.links[0]?.url)}
                                                disabled={bookings.current_page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(bookings.links[bookings.links.length - 1]?.url)}
                                                disabled={bookings.current_page === bookings.last_page}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PatientLayout>
    );
}
