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
import { UserAvatar } from '@/components/ui/user-avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
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

interface BookingStatus {
    id: number;
    name: string;
    description?: string;
}

interface BookingService {
    id: string;
    service_name: string;
    service_code: string;
    service_description?: string;
}

interface BookingItem {
    id: number;
    item_cost: string;
    service: BookingService | null;
}

interface BookingReview {
    id: string;
    rating: number;
    review_text: string;
}

interface ProviderUser {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    profile_image?: string;
}

interface BookingProvider {
    id: string;
    provider_name?: string;
    profile_image_url?: string;
    average_rating: string | number;
    total_reviews: number;
    user: ProviderUser;
}

interface BookingConversation {
    id: string;
}

interface Booking {
    id: string;
    confirmation_number: string | null;
    status: BookingStatus | null;
    scheduled_date: string;
    time_slot: string;
    service_address_line1: string;
    service_address_line2?: string | null;
    service_town_city: string;
    service_postcode: string;
    subtotal_amount: string | number;
    service_fee_percent: string | number;
    service_fee_amount: string | number;
    vat_percent: string | number;
    vat_amount: string | number;
    discount_amount: string | number;
    grand_total_cost: string | number;
    provider: BookingProvider | null;
    items: BookingItem[];
    review: BookingReview | null;
    conversation: BookingConversation | null;
}

interface BookingShowProps {
    booking: Booking;
    can_cancel: boolean;
    can_review: boolean;
}

export default function BookingShow({ booking, can_cancel, can_review }: BookingShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Bookings',
            href: '/bookings',
        },
        {
            title: booking.confirmation_number ?? `Booking #${booking.id.slice(0, 8)}`,
            href: `/bookings/${booking.id}`,
        },
    ];

    const handleCancel = () => {
        if (
            confirm(
                'Are you sure you want to cancel this booking? This action cannot be undone.',
            )
        ) {
            router.delete(`/bookings/${booking.id}`);
        }
    };

    const getStatusBadgeVariant = (statusName: string) => {
        switch (statusName.toLowerCase()) {
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

    const formattedAddress = [
        booking.service_address_line1,
        booking.service_address_line2,
        booking.service_town_city,
        booking.service_postcode,
    ]
        .filter(Boolean)
        .join(', ');

    const providerName =
        booking.provider?.provider_name ??
        booking.provider?.user?.full_name ??
        'Unknown Provider';

    const providerImage =
        booking.provider?.profile_image_url ??
        booking.provider?.user?.profile_image ??
        null;

    const providerPhone = booking.provider?.user?.phone ?? null;
    const providerEmail = booking.provider?.user?.email ?? null;

    const rating = parseFloat(String(booking.provider?.average_rating ?? 0));
    const reviewsCount = booking.provider?.total_reviews ?? 0;

    const subtotalAmount = parseFloat(String(booking.subtotal_amount ?? 0));
    const serviceFeePercent = parseFloat(String(booking.service_fee_percent ?? 0));
    const serviceFeeAmount = parseFloat(String(booking.service_fee_amount ?? 0));
    const vatPercent = parseFloat(String(booking.vat_percent ?? 0));
    const vatAmount = parseFloat(String(booking.vat_amount ?? 0));
    const discountAmount = parseFloat(String(booking.discount_amount ?? 0));
    const totalAmount = parseFloat(String(booking.grand_total_cost ?? 0));

    const statusName = booking.status?.name ?? 'Unknown';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={booking.confirmation_number ?? `Booking #${booking.id.slice(0, 8)}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Booking Details
                        </h1>
                        <p className="text-muted-foreground">
                            Ref: {booking.confirmation_number ?? `#${booking.id.slice(0, 8)}`}
                        </p>
                    </div>
                    <Badge
                        variant={getStatusBadgeVariant(statusName)}
                        className="text-sm"
                    >
                        {statusName}
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
                                                {booking.scheduled_date
                                                    ? format(
                                                          parseISO(
                                                              booking.scheduled_date,
                                                          ),
                                                          'EEEE, MMMM d, yyyy',
                                                      )
                                                    : 'Not scheduled'}
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
                                                {booking.time_slot ?? 'TBC'}
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
                                            {formattedAddress || 'No address provided'}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Blood Tests
                                    </p>
                                    <div className="space-y-2">
                                        {booking.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <span className="text-sm">
                                                    {item.service?.service_name ?? 'Unknown Service'}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    £{parseFloat(String(item.item_cost)).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                        {booking.items.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                No items found.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {can_review && !booking.review && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Leave a Review</CardTitle>
                                    <CardDescription>
                                        Share your experience with{' '}
                                        {providerName}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form
                                        action={`/bookings/${booking.id}/review`}
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
                                                    <Label htmlFor="review_text">
                                                        Comment
                                                    </Label>
                                                    <Textarea
                                                        id="review_text"
                                                        name="review_text"
                                                        rows={4}
                                                        placeholder="Tell us about your experience..."
                                                    />
                                                    {errors.review_text && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.review_text}
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
                                        {booking.review.review_text}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Provider</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {booking.provider ? (
                                    <>
                                        <div className="flex flex-col items-center text-center">
                                            <UserAvatar
                                                name={providerName}
                                                imageUrl={providerImage}
                                                className="mb-3 size-20 text-xl"
                                            />
                                            <h3 className="font-semibold">
                                                {providerName}
                                            </h3>
                                            <div className="mt-1 flex items-center gap-1">
                                                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm">
                                                    {rating.toFixed(1)}{' '}
                                                    ({reviewsCount} reviews)
                                                </span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            {providerPhone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="size-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {providerPhone}
                                                    </span>
                                                </div>
                                            )}
                                            {providerEmail && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="size-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {providerEmail}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        <Link
                                            href={`/chat?booking_id=${booking.id}`}
                                        >
                                            <Button variant="outline" className="w-full">
                                                <MessageCircle className="mr-2 size-4" />
                                                Message
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No provider assigned yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>£{subtotalAmount.toFixed(2)}</span>
                                </div>
                                {serviceFeeAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Service Fee ({serviceFeePercent}%)
                                        </span>
                                        <span>£{serviceFeeAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {vatAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            VAT ({vatPercent}%)
                                        </span>
                                        <span>£{vatAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-600 dark:text-green-400">Discount</span>
                                        <span className="text-green-600 dark:text-green-400">
                                            -£{discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex items-center justify-between font-semibold">
                                    <span>Total</span>
                                    <span>£{totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <CreditCard className="size-4" />
                                    <span>Paid</span>
                                </div>
                            </CardContent>
                        </Card>

                        {can_cancel && (
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
        </AppLayout>
    );
}
