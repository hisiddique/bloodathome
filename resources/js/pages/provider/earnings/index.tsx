import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import ProviderLayout from '@/layouts/provider-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface Earning {
    id: string;
    booking_id: string;
    patient_name: string;
    service: string;
    amount: number;
    date: string;
    status: string;
}

interface EarningsSummary {
    total_earnings: number;
    this_month: number;
    this_week: number;
    pending: number;
    completed_bookings: number;
}

interface ProviderEarningsIndexProps {
    earnings: Earning[];
    summary: EarningsSummary;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/provider/dashboard',
    },
    {
        title: 'Earnings',
        href: '/provider/earnings',
    },
];

export default function ProviderEarningsIndex({
    earnings = [],
    summary,
}: ProviderEarningsIndexProps) {
    const [period, setPeriod] = useState('all');

    const handlePeriodChange = (value: string) => {
        setPeriod(value);
        router.get(
            '/provider/earnings',
            { period: value === 'all' ? undefined : value },
            { preserveState: true },
        );
    };

    return (
        <ProviderLayout breadcrumbs={breadcrumbs}>
            <Head title="Earnings" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Earnings
                        </h2>
                        <p className="text-muted-foreground">
                            Track your income and payments
                        </p>
                    </div>

                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                £{summary?.total_earnings?.toFixed(2) || '0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                This Month
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                £{summary?.this_month?.toFixed(2) || '0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Current month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                This Week
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                £{summary?.this_week?.toFixed(2) || '0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Last 7 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed Bookings
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary?.completed_bookings || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Earnings History</CardTitle>
                        <CardDescription>
                            Your completed bookings and payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {earnings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No earnings yet
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {earnings.map((earning) => (
                                        <TableRow key={earning.id}>
                                            <TableCell>
                                                {format(
                                                    new Date(earning.date),
                                                    'MMM d, yyyy',
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {earning.patient_name}
                                            </TableCell>
                                            <TableCell>
                                                {earning.service}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                £{earning.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                        earning.status ===
                                                        'paid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {earning.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProviderLayout>
    );
}
