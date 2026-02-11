import { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Award, Search, SlidersHorizontal, Clock, Check, X, Map, List } from 'lucide-react';
import { StepBackLink } from './step-back-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useBooking } from '@/contexts/booking-context';
import { useBookingApi } from '@/hooks/use-booking-api';
import { type Provider, type TimeSlot, type Service } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ProviderMap } from './provider-map';
import { ProviderBottomDrawer } from './provider-bottom-drawer';

interface StepProviderProps {
    googleMapsKey?: string;
}

type SortOption = 'distance' | 'rating' | 'price_low' | 'price_high' | 'match';
type ViewMode = 'list' | 'map';

export function StepProvider({ googleMapsKey }: StepProviderProps) {
    const {
        location,
        selectedDate,
        timeOfDay,
        selectedServices,
        collectionType,
        selectedProvider,
        selectedSlot,
        setSelectedProvider,
        setSelectedSlot,
        setBookedServices,
        setProviderServicePrices,
        setStep,
        goBack,
    } = useBooking();

    const { searchProviders, getProviderAvailability } = useBookingApi();

    const [providers, setProviders] = useState<Provider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('match');
    const [maxDistance, setMaxDistance] = useState<number>(10);
    const [minRating, setMinRating] = useState<number>(0);
    const [showFullMatchOnly, setShowFullMatchOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [detailModalProvider, setDetailModalProvider] = useState<Provider | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showAllProviders, setShowAllProviders] = useState(false);
    const timeSlotRef = useRef<HTMLDivElement>(null);

    const INITIAL_DISPLAY_COUNT = 6;

    // Load providers with debounce
    useEffect(() => {
        if (!location || !selectedDate) return;

        setIsLoading(true);

        const timer = setTimeout(async () => {
            try {
                const serviceIds = selectedServices.map((s) => s.id);
                const dateStr = format(selectedDate, 'yyyy-MM-dd');

                const results = await searchProviders({
                    lat: location.lat,
                    lng: location.lng,
                    service_ids: serviceIds,
                    collection_type: collectionType || undefined,
                    date: dateStr,
                    radius_km: maxDistance,
                });

                setProviders(results);
                setFilteredProviders(results);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load providers';
                toast.error(message);
                console.error('Error loading providers:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [location, selectedDate, collectionType, selectedServices, maxDistance]);

    // Filter and sort providers
    useEffect(() => {
        let filtered = [...providers];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) => {
                    const providerName = p.user?.full_name || p.name || '';
                    return (
                        providerName.toLowerCase().includes(query) ||
                        p.provider_name?.toLowerCase().includes(query) ||
                        p.bio?.toLowerCase().includes(query)
                    );
                }
            );
        }

        // Apply rating filter
        if (minRating > 0) {
            filtered = filtered.filter((p) => p.average_rating >= minRating);
        }

        // Apply full match filter
        if (showFullMatchOnly) {
            filtered = filtered.filter((p) => {
                return p.services_matched === p.services_total && p.services_total > 0;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'match':
                    const matchPercentA = (a.services_matched || 0) / (a.services_total || 1);
                    const matchPercentB = (b.services_matched || 0) / (b.services_total || 1);
                    if (matchPercentB !== matchPercentA) {
                        return matchPercentB - matchPercentA;
                    }
                    return (a.distance_km || 0) - (b.distance_km || 0);
                case 'distance':
                    return (a.distance_km || 0) - (b.distance_km || 0);
                case 'rating':
                    return b.average_rating - a.average_rating;
                case 'price_low':
                    return getProviderPrice(a) - getProviderPrice(b);
                case 'price_high':
                    return getProviderPrice(b) - getProviderPrice(a);
                default:
                    return 0;
            }
        });

        setFilteredProviders(filtered);
    }, [providers, searchQuery, sortBy, minRating, showFullMatchOnly]);

    // Reset showAllProviders when filters change
    useEffect(() => {
        setShowAllProviders(false);
    }, [filteredProviders]);

    const getProviderPrice = (provider: Provider): number => {
        if (provider.total_price !== undefined) {
            return provider.total_price;
        }
        if (!provider.provider_services || provider.provider_services.length === 0) {
            return 0;
        }
        return provider.provider_services.reduce((sum, ps) => sum + ps.base_cost, 0);
    };

    const handleProviderSelect = async (provider: Provider) => {
        setSelectedProvider(provider);
        setSelectedSlot(null);

        if (provider.matched_services && provider.matched_services.length > 0) {
            const matchedServiceObjects: Service[] = provider.matched_services.map((ms) => ({
                id: ms.id,
                service_name: ms.name,
                service_code: '',
                is_active: true,
                category: { id: 0, name: '' },
            }));
            setBookedServices(matchedServiceObjects);

            const prices: Record<string, number> = {};
            provider.matched_services.forEach((ms) => {
                prices[ms.id] = ms.price;
            });
            setProviderServicePrices(prices);
        } else {
            setBookedServices(selectedServices);
        }

        if (selectedDate) {
            await loadProviderAvailability(provider.id, selectedDate);
        }

        // Scroll to time slot section after selection
        setTimeout(() => {
            timeSlotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const loadProviderAvailability = async (providerId: string, date: Date) => {
        setIsLoadingSlots(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const slots = await getProviderAvailability(providerId, dateStr);
            setAvailableSlots(slots);
        } catch (error) {
            console.error('Error loading availability:', error);
            toast.error('Failed to load available time slots');
            setAvailableSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    // Load availability for pre-selected provider (e.g. when returning from a later step)
    useEffect(() => {
        if (selectedProvider && selectedDate && availableSlots.length === 0 && !isLoadingSlots) {
            loadProviderAvailability(selectedProvider.id, selectedDate);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
    };

    const handleContinue = () => {
        if (!selectedProvider) {
            toast.error('Please select a provider');
            return;
        }

        if (!selectedSlot) {
            toast.error('Please select a time slot');
            return;
        }

        setStep('patient');
    };

    // Compute displayed providers for list view
    const shouldPaginate = filteredProviders.length >= INITIAL_DISPLAY_COUNT * 2;
    const displayedProviders = shouldPaginate && !showAllProviders
        ? filteredProviders.slice(0, INITIAL_DISPLAY_COUNT)
        : filteredProviders;
    const remainingCount = filteredProviders.length - INITIAL_DISPLAY_COUNT;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <StepBackLink label="Back to Location & Date" onClick={goBack} />
                <h1 className="text-2xl font-semibold text-foreground mb-2">Select Provider</h1>
                <p className="text-muted-foreground">
                    Found {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} in your area
                </p>
            </div>

            {/* Search, View Toggle, and Filters */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search providers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                        <Button
                            type="button"
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="px-3"
                            aria-label="List view"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={viewMode === 'map' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('map')}
                            className="px-3"
                            aria-label="Map view"
                        >
                            <Map className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4"
                        aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                        aria-expanded={showFilters}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                </div>

                {showFilters && (
                    <div className="space-y-3 p-4 bg-accent/30 rounded-xl border border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground">Sort By</label>
                                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="match">Best Match</SelectItem>
                                        <SelectItem value="distance">Distance</SelectItem>
                                        <SelectItem value="rating">Rating</SelectItem>
                                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">Max Distance (km)</label>
                            <Select value={maxDistance.toString()} onValueChange={(v) => setMaxDistance(Number(v))}>
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 km</SelectItem>
                                    <SelectItem value="10">10 km</SelectItem>
                                    <SelectItem value="20">20 km</SelectItem>
                                    <SelectItem value="50">50 km</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground">Min Rating</label>
                                <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">All Ratings</SelectItem>
                                        <SelectItem value="3">3+ Stars</SelectItem>
                                        <SelectItem value="4">4+ Stars</SelectItem>
                                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                id="fullMatchOnly"
                                checked={showFullMatchOnly}
                                onCheckedChange={(checked) => setShowFullMatchOnly(checked as boolean)}
                            />
                            <label htmlFor="fullMatchOnly" className="text-sm text-foreground cursor-pointer">
                                Only show providers with all selected services
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Providers List or Map */}
            {filteredProviders.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No providers found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {providers.length === 0
                            ? `No providers available within ${maxDistance} km`
                            : 'Try adjusting your filters or increasing the search radius'}
                    </p>
                    <div className="flex gap-2 justify-center">
                        {maxDistance < 25 && (
                            <Button type="button" variant="outline" onClick={() => setMaxDistance(25)}>
                                Expand to 25 km
                            </Button>
                        )}
                        {showFullMatchOnly && (
                            <Button type="button" variant="outline" onClick={() => setShowFullMatchOnly(false)}>
                                Show Partial Matches
                            </Button>
                        )}
                        <Button type="button" variant="outline" onClick={goBack}>
                            Change Location
                        </Button>
                    </div>
                </div>
            ) : viewMode === 'map' ? (
                <>
                    <ProviderMap
                        providers={filteredProviders}
                        userLocation={location!}
                        selectedProvider={selectedProvider}
                        onProviderClick={(provider) => setDetailModalProvider(provider)}
                    />
                    {/* Mobile bottom drawer for provider list */}
                    <ProviderBottomDrawer
                        providers={filteredProviders}
                        selectedProvider={selectedProvider}
                        onProviderClick={(provider) => setDetailModalProvider(provider)}
                    />
                </>
            ) : (
                <>
                    <div className="space-y-3">
                        {displayedProviders.map((provider) => {
                            const isSelected = selectedProvider?.id === provider.id;
                            const price = getProviderPrice(provider);

                            return (
                                <div
                                    key={provider.id}
                                    className={cn(
                                        'p-4 rounded-xl border-2 transition-all cursor-pointer',
                                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                    )}
                                    onClick={() => handleProviderSelect(provider)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Provider Image */}
                                        {provider.show_image_in_search && provider.user?.profile_image ? (
                                            <img
                                                src={provider.user.profile_image}
                                                alt={provider.user?.full_name || provider.name || 'Provider'}
                                                className="w-16 h-16 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-xl font-semibold text-primary">
                                                    {(provider.user?.full_name || provider.name || 'P').charAt(0)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Provider Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-foreground">
                                                            {provider.user?.full_name || provider.name || 'Unknown Provider'}
                                                        </h3>
                                                        {provider.services_matched !== undefined &&
                                                            provider.services_total !== undefined && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-xs',
                                                                        provider.services_matched === provider.services_total
                                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                                                            : 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                                                                    )}
                                                                >
                                                                    {provider.services_matched} of {provider.services_total}{' '}
                                                                    services
                                                                </Badge>
                                                            )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{provider.type.name}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-lg font-bold text-primary">£{price.toFixed(2)}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {provider.services_matched !== undefined &&
                                                        provider.services_matched < (provider.services_total || 0)
                                                            ? 'partial'
                                                            : 'total'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-medium text-foreground">
                                                        {provider.average_rating.toFixed(1)}
                                                    </span>
                                                    <span>({provider.total_reviews})</span>
                                                </div>

                                                {provider.distance_km !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{provider.distance_km.toFixed(1)} km away</span>
                                                    </div>
                                                )}

                                                {provider.experience_years && (
                                                    <div className="flex items-center gap-1">
                                                        <Award className="w-4 h-4" />
                                                        <span>{provider.experience_years}+ years</span>
                                                    </div>
                                                )}
                                            </div>

                                            {provider.bio && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                    {provider.bio}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDetailModalProvider(provider);
                                                }}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More Button */}
                    {shouldPaginate && !showAllProviders && (
                        <div className="flex justify-center pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAllProviders(true)}
                                className="w-full sm:w-auto"
                            >
                                Show {remainingCount} more provider{remainingCount !== 1 ? 's' : ''}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Time Slot Selection */}
            {selectedProvider && (
                <div ref={timeSlotRef} className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Select Time Slot</h3>
                    </div>

                    {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No available time slots for the selected date.</p>
                            <p className="text-sm mt-2">Please try a different provider or date.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {availableSlots.map((slot) => {
                                const isSelected = selectedSlot?.time === slot.time;
                                const isDisabled = !slot.available;

                                return (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        onClick={() => handleSlotSelect(slot)}
                                        disabled={isDisabled}
                                        className={cn(
                                            'p-3 rounded-lg border-2 transition-all text-sm font-medium',
                                            isSelected && 'border-primary bg-primary/10 text-primary',
                                            !isSelected && !isDisabled && 'border-border hover:border-primary/50 text-foreground',
                                            isDisabled && 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        {slot.time}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    onClick={handleContinue}
                    disabled={!selectedProvider || !selectedSlot}
                    className="flex-1 py-6 text-base"
                    size="lg"
                >
                    Continue to Patient Details
                </Button>
            </div>

            {/* Provider Detail Modal */}
            <Dialog open={!!detailModalProvider} onOpenChange={() => setDetailModalProvider(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                    {detailModalProvider && (
                        <>
                            {/* Fixed Header */}
                            <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
                                <DialogTitle>
                                    {detailModalProvider.user?.full_name || detailModalProvider.name || 'Provider Details'}
                                </DialogTitle>
                            </DialogHeader>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                <div className="flex items-start gap-4">
                                    {detailModalProvider.user?.profile_image ? (
                                        <img
                                            src={detailModalProvider.user.profile_image}
                                            alt={detailModalProvider.user?.full_name || detailModalProvider.name || 'Provider'}
                                            className="w-24 h-24 rounded-full object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-3xl font-semibold text-primary">
                                                {(detailModalProvider.user?.full_name || detailModalProvider.name || 'P').charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {detailModalProvider.type.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-medium">
                                                    {detailModalProvider.average_rating.toFixed(1)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    ({detailModalProvider.total_reviews} reviews)
                                                </span>
                                            </div>

                                            {detailModalProvider.experience_years && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Award className="w-4 h-4" />
                                                    <span>{detailModalProvider.experience_years}+ years experience</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {detailModalProvider.bio && (
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">About</h4>
                                        <p className="text-sm text-muted-foreground">{detailModalProvider.bio}</p>
                                    </div>
                                )}

                                {(detailModalProvider.matched_services || detailModalProvider.unmatched_services) && (
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Requested Services</h4>
                                        <div className="space-y-2">
                                            {detailModalProvider.matched_services?.map((ms) => (
                                                <div
                                                    key={ms.id}
                                                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        <span className="text-sm text-foreground">{ms.name}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground">
                                                        £{ms.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                            {detailModalProvider.unmatched_services?.map((us) => (
                                                <div
                                                    key={us.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <X className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-muted-foreground">{us.name}</span>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">Not available</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailModalProvider.provider_services &&
                                    detailModalProvider.provider_services.length > 0 &&
                                    !detailModalProvider.matched_services && (
                                        <div>
                                            <h4 className="font-medium text-foreground mb-2">Services & Pricing</h4>
                                            <div className="space-y-2">
                                                {detailModalProvider.provider_services.map((ps) => (
                                                    <div
                                                        key={ps.id}
                                                        className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                                                    >
                                                        <span className="text-sm text-foreground">
                                                            {ps.service.service_name}
                                                        </span>
                                                        <span className="text-sm font-medium text-foreground">
                                                            £{ps.base_cost.toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* Sticky Footer */}
                            <div className="px-6 py-4 border-t border-border bg-background shrink-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="text-xl font-bold text-primary">
                                            £{detailModalProvider.total_price?.toFixed(2) || getProviderPrice(detailModalProvider).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setDetailModalProvider(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleProviderSelect(detailModalProvider);
                                                setDetailModalProvider(null);
                                            }}
                                            disabled={
                                                detailModalProvider.matched_services &&
                                                detailModalProvider.matched_services.length === 0
                                            }
                                        >
                                            {detailModalProvider.matched_services &&
                                            detailModalProvider.matched_services.length < (detailModalProvider.services_total || 0)
                                                ? `Select (${detailModalProvider.matched_services.length} services)`
                                                : 'Select Provider'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
