import { Calendar, MapPin, User, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '@/contexts/booking-context';
import { usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { cn } from '@/lib/utils';

interface BookingSummaryProps {
    className?: string;
}

export function BookingSummary({ className }: BookingSummaryProps) {
    const {
        selectedServices,
        collectionType,
        location,
        selectedDate,
        timeOfDay,
        selectedProvider,
        totalAmount,
        discount,
    } = useBooking();

    const { serviceFeePercentage, vatPercentage } = usePage<PageProps>().props;

    const subtotal = selectedServices.reduce((sum, service) => {
        const price = service.base_price || 0;
        return sum + price;
    }, 0);

    const serviceFee = subtotal * (serviceFeePercentage / 100);
    const vat = (subtotal + serviceFee) * (vatPercentage / 100);
    const totalBeforeDiscount = subtotal + serviceFee + vat;
    const finalTotal = discount ? totalBeforeDiscount - discount : totalBeforeDiscount;

    if (selectedServices.length === 0) {
        return null;
    }

    return (
        <div className={cn('bg-card border border-border rounded-2xl p-6 space-y-4', className)}>
            <h3 className="text-lg font-semibold text-foreground">Booking Summary</h3>

            {/* Collection Type */}
            {collectionType && (
                <div className="flex items-start gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-foreground capitalize">
                            {collectionType.replace('_', ' ')}
                        </div>
                        {location && (
                            <div className="text-xs text-muted-foreground mt-1">{location.postcode}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Date & Time */}
            {selectedDate && (
                <div className="flex items-start gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                            {format(selectedDate, 'EEE, dd MMM yyyy')}
                        </div>
                        {timeOfDay && (
                            <div className="text-xs text-muted-foreground mt-1 capitalize">{timeOfDay}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Provider */}
            {selectedProvider && (
                <div className="flex items-start gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                            {selectedProvider.user.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {selectedProvider.type.name}
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Services */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Selected Tests</h4>
                {selectedServices.map((service) => (
                    <div key={service.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate">{service.service_name}</div>
                            <div className="text-xs text-muted-foreground">{service.service_code}</div>
                        </div>
                        <div className="text-sm font-medium text-foreground whitespace-nowrap">
                            £{(service.base_price || 0).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee ({serviceFeePercentage}%)</span>
                    <span className="text-foreground">£{serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">VAT ({vatPercentage}%)</span>
                    <span className="text-foreground">£{vat.toFixed(2)}</span>
                </div>
                {discount && discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">Discount</span>
                        <span className="text-green-600 dark:text-green-400">-£{discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">£{finalTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
