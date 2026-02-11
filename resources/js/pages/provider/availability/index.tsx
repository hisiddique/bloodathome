import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface TimeSlot {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

interface ProviderAvailabilityIndexProps {
    time_slots: TimeSlot[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Availability',
        href: '/availability',
    },
];

const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const timeOptions = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
];

export default function ProviderAvailabilityIndex({
    time_slots = [],
}: ProviderAvailabilityIndexProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date(),
    );
    const [isAddingSlot, setIsAddingSlot] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        day_of_week: '',
        start_time: '',
        end_time: '',
    });

    const handleAddSlot = (e: React.FormEvent) => {
        e.preventDefault();
        post('/availability', {
            onSuccess: () => {
                setIsAddingSlot(false);
                reset();
            },
        });
    };

    const handleDeleteSlot = (id: string) => {
        if (confirm('Are you sure you want to delete this time slot?')) {
            router.delete(`/availability/${id}`);
        }
    };

    const slotsByDay = time_slots.reduce(
        (acc, slot) => {
            if (!acc[slot.day_of_week]) {
                acc[slot.day_of_week] = [];
            }
            acc[slot.day_of_week].push(slot);
            return acc;
        },
        {} as Record<number, TimeSlot[]>,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Availability" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Availability
                        </h2>
                        <p className="text-muted-foreground">
                            Manage your weekly schedule
                        </p>
                    </div>
                    <Button onClick={() => setIsAddingSlot(!isAddingSlot)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Time Slot
                    </Button>
                </div>

                {isAddingSlot && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Time Slot</CardTitle>
                            <CardDescription>
                                Set your availability for a specific day
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleAddSlot}
                                className="space-y-4"
                            >
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Day of Week
                                        </label>
                                        <Select
                                            value={data.day_of_week}
                                            onValueChange={(value) =>
                                                setData('day_of_week', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select day" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {daysOfWeek.map((day) => (
                                                    <SelectItem
                                                        key={day.value}
                                                        value={day.value.toString()}
                                                    >
                                                        {day.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.day_of_week && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.day_of_week}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Start Time
                                        </label>
                                        <Select
                                            value={data.start_time}
                                            onValueChange={(value) =>
                                                setData('start_time', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.map((time) => (
                                                    <SelectItem
                                                        key={time}
                                                        value={time}
                                                    >
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.start_time && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.start_time}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            End Time
                                        </label>
                                        <Select
                                            value={data.end_time}
                                            onValueChange={(value) =>
                                                setData('end_time', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.map((time) => (
                                                    <SelectItem
                                                        key={time}
                                                        value={time}
                                                    >
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.end_time && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.end_time}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        Add Slot
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddingSlot(false);
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 lg:grid-cols-7">
                    {daysOfWeek.map((day) => (
                        <Card key={day.value}>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {day.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {slotsByDay[day.value]?.length > 0 ? (
                                    slotsByDay[day.value].map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between rounded-lg border p-2"
                                        >
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {slot.start_time}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {slot.end_time}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    handleDeleteSlot(slot.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No slots
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
