import { Calendar, MapPin, User, Clock, Stethoscope, X } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '@/contexts/booking-context';
import { usePage } from '@inertiajs/react';
import { type PageProps, type Service } from '@/types';
import { cn } from '@/lib/utils';

interface BookingSummaryProps {
    className?: string;
}

export function BookingSummary({ className }: BookingSummaryProps) {
    const {
        selectedServices,
        bookedServices,
        providerServicePrices,
        collectionType,
        location,
        selectedDate,
        selectedSlot,
        selectedProvider,
        discount,
        setSelectedServices,
    } = useBooking();

    const { serviceFeePercentage, vatPercentage } = usePage<PageProps>().props;

    // Use bookedServices if provider selected (may be subset), otherwise selectedServices
    const displayServices = selectedProvider && bookedServices.length > 0 ? bookedServices : selectedServices;
    const hasProvider = !!selectedProvider;

    // Calculate prices only if provider is selected
    const subtotal = hasProvider
        ? displayServices.reduce((sum, service) => {
              const price = providerServicePrices[service.id] || 0;
              return sum + price;
          }, 0)
        : 0;

    const serviceFee = subtotal * (serviceFeePercentage / 100);
    const vat = (subtotal + serviceFee) * (vatPercentage / 100);
    const totalBeforeDiscount = subtotal + serviceFee + vat;
    const finalTotal = discount ? totalBeforeDiscount - discount : totalBeforeDiscount;

    const handleRemoveService = (serviceToRemove: Service) => {
        setSelectedServices(selectedServices.filter((s) => s.id !== serviceToRemove.id));
    };

    if (displayServices.length === 0 && !collectionType) {
        return (
            <div className={cn('bg-card border border-border rounded-2xl p-6', className)}>
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
                <p className="text-sm text-muted-foreground text-center py-4">
                    Select services to begin
                </p>
            </div>
        );
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
                        {selectedSlot && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                {selectedSlot.time}
                            </div>
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
            {displayServices.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium text-foreground">
                            Selected Tests ({displayServices.length})
                        </h4>
                    </div>
                    <div className="space-y-1.5">
                        {displayServices.map((service) => (
                            <div key={service.id} className="flex items-center justify-between gap-2 group">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground truncate">{service.service_name}</div>
                                </div>
                                {hasProvider ? (
                                    <div className="text-sm font-medium text-foreground whitespace-nowrap">
                                        £{(providerServicePrices[service.id] || 0).toFixed(2)}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveService(service)}
                                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        aria-label={`Remove ${service.service_name}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cost Breakdown - Only show after provider selection */}
            {hasProvider && subtotal > 0 && (
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
            )}

            {/* Message when no provider selected yet */}
            {!hasProvider && displayServices.length > 0 && (
                <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        Prices will be shown after selecting a provider
                    </p>
                </div>
            )}
        </div>
    );
}
