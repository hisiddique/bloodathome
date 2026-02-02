import { useState, useEffect } from 'react';
import { Star, MapPin, Award, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBooking } from '@/contexts/booking-context';
import { useBookingApi } from '@/hooks/use-booking-api';
import { type Provider } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StepProviderProps {
    googleMapsKey?: string;
}

type SortOption = 'distance' | 'rating' | 'price_low' | 'price_high';

export function StepProvider({ googleMapsKey }: StepProviderProps) {
    const {
        location,
        selectedDate,
        timeOfDay,
        selectedServices,
        collectionType,
        selectedProvider,
        setSelectedProvider,
        setStep,
        goBack,
    } = useBooking();

    const { searchProviders } = useBookingApi();

    const [providers, setProviders] = useState<Provider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('distance');
    const [maxDistance, setMaxDistance] = useState<number>(10);
    const [minRating, setMinRating] = useState<number>(0);
    const [showFilters, setShowFilters] = useState(false);
    const [detailModalProvider, setDetailModalProvider] = useState<Provider | null>(null);

    // Load providers
    useEffect(() => {
        if (!location || !selectedDate) return;

        const loadProviders = async () => {
            setIsLoading(true);
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
                toast.error('Failed to load providers');
                console.error('Error loading providers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProviders();
    }, [location, selectedDate, collectionType, selectedServices, maxDistance]);

    // Filter and sort providers
    useEffect(() => {
        let filtered = [...providers];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.user.full_name.toLowerCase().includes(query) ||
                    p.provider_name?.toLowerCase().includes(query) ||
                    p.bio?.toLowerCase().includes(query)
            );
        }

        // Apply rating filter
        if (minRating > 0) {
            filtered = filtered.filter((p) => p.average_rating >= minRating);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
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
    }, [providers, searchQuery, sortBy, minRating]);

    const getProviderPrice = (provider: Provider): number => {
        if (!provider.provider_services || provider.provider_services.length === 0) {
            return 0;
        }
        return provider.provider_services.reduce((sum, ps) => sum + ps.base_cost, 0);
    };

    const handleProviderSelect = (provider: Provider) => {
        setSelectedProvider(provider);
    };

    const handleContinue = () => {
        if (!selectedProvider) {
            toast.error('Please select a provider');
            return;
        }

        setStep('patient');
    };

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
                <h1 className="text-2xl font-semibold text-foreground mb-2">Select Provider</h1>
                <p className="text-muted-foreground">
                    Found {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} in your area
                </p>
            </div>

            {/* Search and Filters */}
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-accent/30 rounded-xl border border-border">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">Sort By</label>
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
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
                )}
            </div>

            {/* Providers List */}
            {filteredProviders.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No providers found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your filters or increasing the search radius
                    </p>
                    <Button type="button" variant="outline" onClick={() => setMaxDistance(20)}>
                        Increase Search Radius
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredProviders.map((provider) => {
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
                                    {provider.show_image_in_search && provider.user.profile_image ? (
                                        <img
                                            src={provider.user.profile_image}
                                            alt={provider.user.full_name}
                                            className="w-16 h-16 rounded-full object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-xl font-semibold text-primary">
                                                {provider.user.full_name.charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Provider Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h3 className="font-semibold text-foreground">
                                                    {provider.user.full_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{provider.type.name}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-lg font-bold text-primary">£{price.toFixed(2)}</div>
                                                <div className="text-xs text-muted-foreground">total</div>
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
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" onClick={goBack} className="sm:w-auto w-full py-6">
                    Back
                </Button>
                <Button
                    onClick={handleContinue}
                    disabled={!selectedProvider}
                    className="flex-1 py-6 text-base"
                    size="lg"
                >
                    Continue to Patient Details
                </Button>
            </div>

            {/* Provider Detail Modal */}
            <Dialog open={!!detailModalProvider} onOpenChange={() => setDetailModalProvider(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {detailModalProvider && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{detailModalProvider.user.full_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    {detailModalProvider.user.profile_image ? (
                                        <img
                                            src={detailModalProvider.user.profile_image}
                                            alt={detailModalProvider.user.full_name}
                                            className="w-24 h-24 rounded-full object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-3xl font-semibold text-primary">
                                                {detailModalProvider.user.full_name.charAt(0)}
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

                                {detailModalProvider.provider_services && detailModalProvider.provider_services.length > 0 && (
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

                                <div className="pt-4">
                                    <Button
                                        onClick={() => {
                                            handleProviderSelect(detailModalProvider);
                                            setDetailModalProvider(null);
                                        }}
                                        className="w-full"
                                    >
                                        Select This Provider
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
