import { useState } from 'react';
import { ChevronUp, ChevronDown, Star, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Provider } from '@/types';

interface ProviderBottomDrawerProps {
    providers: Provider[];
    selectedProvider: Provider | null;
    onProviderClick: (provider: Provider) => void;
}

export function ProviderBottomDrawer({
    providers,
    selectedProvider,
    onProviderClick,
}: ProviderBottomDrawerProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const displayCount = isExpanded ? providers.length : 2;
    const displayProviders = providers.slice(0, displayCount);

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-2xl z-20 transition-all duration-300 lg:hidden',
                isExpanded ? 'max-h-[70vh]' : 'max-h-[200px]'
            )}
        >
            {/* Drag Handle */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-3 flex flex-col items-center gap-1 cursor-pointer touch-manipulation"
                aria-label={isExpanded ? 'Collapse provider list' : 'Expand provider list'}
            >
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {isExpanded ? (
                        <>
                            <ChevronDown className="w-3 h-3" />
                            <span>Collapse</span>
                        </>
                    ) : (
                        <>
                            <ChevronUp className="w-3 h-3" />
                            <span>{providers.length} providers nearby</span>
                        </>
                    )}
                </div>
            </button>

            {/* Provider List */}
            <div
                className={cn(
                    'overflow-y-auto px-4 pb-4 space-y-2',
                    isExpanded ? 'max-h-[calc(70vh-60px)]' : 'max-h-[140px]'
                )}
            >
                {displayProviders.map((provider) => {
                    const isSelected = selectedProvider?.id === provider.id;
                    const isFullMatch =
                        provider.services_matched === provider.services_total &&
                        (provider.services_total ?? 0) > 0;
                    const price = provider.total_price ?? 0;

                    return (
                        <button
                            key={provider.id}
                            type="button"
                            onClick={() => !isSelected && onProviderClick(provider)}
                            disabled={isSelected}
                            className={cn(
                                'w-full p-3 rounded-xl border transition-all text-left',
                                isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 cursor-default'
                                    : 'border-border hover:border-primary/50 cursor-pointer'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold',
                                        isSelected
                                            ? 'bg-blue-500 text-white'
                                            : isFullMatch
                                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                    )}
                                >
                                    {isSelected ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        (provider.user?.full_name || provider.provider_name || 'P').charAt(0)
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground text-sm truncate">
                                            {provider.user?.full_name || provider.provider_name || 'Unknown'}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'text-[10px] px-1.5 py-0',
                                                isFullMatch
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                                    : 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                                            )}
                                        >
                                            {provider.services_matched}/{provider.services_total}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span className="flex items-center gap-0.5">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            {provider.average_rating?.toFixed(1)}
                                        </span>
                                        {provider.distance_km !== undefined && (
                                            <span className="flex items-center gap-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {provider.distance_km.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-right shrink-0">
                                    <div className="font-bold text-foreground">£{price.toFixed(0)}</div>
                                </div>
                            </div>
                        </button>
                    );
                })}

                {!isExpanded && providers.length > 2 && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(true)}
                        className="w-full py-2 text-sm text-primary font-medium"
                    >
                        Show {providers.length - 2} more providers
                    </button>
                )}
            </div>
        </div>
    );
}
