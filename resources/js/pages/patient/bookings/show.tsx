import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import PatientLayout from '@/layouts/patient-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    CreditCard,
    MapPin,
    MessageCircle,
    Phone,
    Star,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Booking {
    id: string;
    phlebotomist: {
        id: string;
        name: string;
        image: string | null;
        phone: string;
        email: string;
        rating: number;
        reviews_count: number;
    };
    appointment_date: string;
    time_slot: string;
    address: string;
    status: string;
    total_amount: number;
    blood_tests: Array<{
        id: string;
        name: string;
        price: number;
    }>;
    can_cancel: boolean;
    can_review: boolean;
    review?: {
        rating: number;
        comment: string;
    };
}

interface BookingShowProps {
    booking: Booking;
}

export default function BookingShow({ booking }: BookingShowProps) {
    const [showReviewForm, setShowReviewForm] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Bookings',
            href: '/patient/bookings',
        },
        {
            title: `Booking #${booking.id.slice(0, 8)}`,
            href: `/patient/bookings/${booking.id}`,
        },
    ];

    const handleCancel = () => {
        if (
            confirm(
                'Are you sure you want to cancel this booking? This action cannot be undone.',
            )
        ) {
            router.delete(`/patient/bookings/${booking.id}`);
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
            <Head title={`Booking #${booking.id.slice(0, 8)}`} />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Booking Details
                        </h1>
                        <p className="text-muted-foreground">
                            Reference: #{booking.id.slice(0, 8)}
                        </p>
                    </div>
                    <Badge
                        variant={getStatusBadgeVariant(booking.status)}
                        className="text-sm"
                    >
                        {booking.status}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appointment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="mt-1 size-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Date
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(
                                                    new Date(
                                                        booking.appointment_date,
                                                    ),
                                                    'EEEE, MMMM d, yyyy',
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="mt-1 size-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Time
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.time_slot}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-1 size-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Location
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.address}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Blood Tests
                                    </p>
                                    <div className="space-y-2">
                                        {booking.blood_tests.map((test) => (
                                            <div
                                                key={test.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <span className="text-sm">
                                                    {test.name}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    £{test.price.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {booking.can_review && !booking.review && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Leave a Review</CardTitle>
                                    <CardDescription>
                                        Share your experience with{' '}
                                        {booking.phlebotomist.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form
                                        action={`/patient/bookings/${booking.id}/review`}
                                        method="post"
                                        className="space-y-4"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="rating">
                                                        Rating
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    className="size-8 rounded-full hover:bg-accent"
                                                                >
                                                                    <Star className="size-8 text-yellow-400" />
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                    {errors.rating && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.rating}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="comment">
                                                        Comment
                                                    </Label>
                                                    <Textarea
                                                        id="comment"
                                                        name="comment"
                                                        rows={4}
                                                        placeholder="Tell us about your experience..."
                                                    />
                                                    {errors.comment && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.comment}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Submit Review
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        {booking.review && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Your Review</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`size-5 ${
                                                    star <= booking.review!.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {booking.review.comment}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Phlebotomist</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col items-center text-center">
                                    <img
                                        src={
                                            booking.phlebotomist.image ||
                                            '/placeholder.svg'
                                        }
                                        alt={booking.phlebotomist.name}
                                        className="mb-3 size-20 rounded-full object-cover"
                                    />
                                    <h3 className="font-semibold">
                                        {booking.phlebotomist.name}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-1">
                                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm">
                                            {booking.phlebotomist.rating.toFixed(
                                                1,
                                            )}{' '}
                                            (
                                            {
                                                booking.phlebotomist
                                                    .reviews_count
                                            }{' '}
                                            reviews)
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="size-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {booking.phlebotomist.phone}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="size-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {booking.phlebotomist.email}
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                <Link
                                    href={`/patient/chat?booking_id=${booking.id}`}
                                >
                                    <Button variant="outline" className="w-full">
                                        <MessageCircle className="mr-2 size-4" />
                                        Message
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>£{booking.total_amount.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between font-semibold">
                                    <span>Total</span>
                                    <span>£{booking.total_amount.toFixed(2)}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <CreditCard className="size-4" />
                                    <span>Paid</span>
                                </div>
                            </CardContent>
                        </Card>

                        {booking.can_cancel && (
                            <Button
                                variant="destructive"
                                className="mt-6 w-full"
                                onClick={handleCancel}
                            >
                                Cancel Booking
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}
