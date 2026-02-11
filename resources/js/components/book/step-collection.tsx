import { useState, useEffect } from 'react';
import { Search, X, Check, Home, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useBooking } from '@/contexts/booking-context';
import { useBookingApi } from '@/hooks/use-booking-api';
import { type Service, type CollectionType } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function StepCollection() {
    const {
        collectionType,
        isNhsTest,
        selectedServices,
        setCollectionType,
        setIsNhsTest,
        setSelectedServices,
        setStep,
    } = useBooking();

    const { fetchServices, fetchCollectionTypes } = useBookingApi();

    const [collectionTypes, setCollectionTypes] = useState<CollectionType[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Load collection types and services
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [types, servicesList] = await Promise.all([
                    fetchCollectionTypes(),
                    fetchServices(),
                ]);
                setCollectionTypes(types);
                setServices(servicesList);
                setFilteredServices(servicesList);
            } catch (error) {
                toast.error('Failed to load services');
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter services based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredServices(services);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = services.filter(
            (service) =>
                service.service_name?.toLowerCase().includes(query) ||
                service.service_code?.toLowerCase().includes(query) ||
                service.service_description?.toLowerCase().includes(query) ||
                service.category?.name?.toLowerCase().includes(query)
        );
        setFilteredServices(filtered);
    }, [searchQuery, services]);

    const handleCollectionTypeSelect = (type: 'home_visit' | 'clinic') => {
        setCollectionType(type);
    };

    const toggleService = (service: Service) => {
        const isSelected = selectedServices.some((s) => s.id === service.id);
        if (isSelected) {
            setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const handleContinue = () => {
        if (!collectionType) {
            toast.error('Please select a collection type');
            return;
        }

        if (selectedServices.length === 0) {
            toast.error('Please select at least one service');
            return;
        }

        setStep('location');
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
                <h1 className="text-2xl font-semibold text-foreground mb-2">Choose Your Test</h1>
                <p className="text-muted-foreground">Select collection type and services you need</p>
            </div>

            {/* Collection Type Selection */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Collection Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleCollectionTypeSelect('home_visit')}
                        className={cn(
                            'p-4 rounded-xl border-2 transition-all text-left',
                            collectionType === 'home_visit'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                    collectionType === 'home_visit' ? 'bg-primary' : 'bg-muted'
                                )}
                            >
                                <Home
                                    className={cn(
                                        'w-5 h-5',
                                        collectionType === 'home_visit' ? 'text-primary-foreground' : 'text-foreground'
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-foreground">Home Visit</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Professional visits your location
                                </div>
                            </div>
                            {collectionType === 'home_visit' && (
                                <Check className="w-5 h-5 text-primary shrink-0" />
                            )}
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleCollectionTypeSelect('clinic')}
                        className={cn(
                            'p-4 rounded-xl border-2 transition-all text-left',
                            collectionType === 'clinic'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                                    collectionType === 'clinic' ? 'bg-primary' : 'bg-muted'
                                )}
                            >
                                <Building2
                                    className={cn(
                                        'w-5 h-5',
                                        collectionType === 'clinic' ? 'text-primary-foreground' : 'text-foreground'
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-foreground">Clinic Visit</div>
                                <div className="text-xs text-muted-foreground mt-1">Visit a clinic location</div>
                            </div>
                            {collectionType === 'clinic' && <Check className="w-5 h-5 text-primary shrink-0" />}
                        </div>
                    </button>
                </div>
            </div>

            {/* NHS Test Toggle */}
            <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-xl border border-border">
                <Checkbox id="nhs-test" checked={isNhsTest} onCheckedChange={(checked) => setIsNhsTest(checked === true)} />
                <label htmlFor="nhs-test" className="text-sm text-foreground cursor-pointer flex-1">
                    This is an NHS test (requires NHS number)
                </label>
            </div>

            {/* Service Selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Select Services</label>
                    {selectedServices.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {selectedServices.length} selected
                        </span>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Services List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No services found</p>
                        </div>
                    ) : (
                        filteredServices.map((service) => {
                            const isSelected = selectedServices.some((s) => s.id === service.id);

                            return (
                                <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => toggleService(service)}
                                    className={cn(
                                        'w-full p-4 rounded-xl border transition-all text-left',
                                        isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    )}
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    aria-label={service.service_name}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5',
                                                isSelected
                                                    ? 'bg-primary border-primary'
                                                    : 'border-muted-foreground'
                                            )}
                                            aria-hidden="true"
                                        >
                                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-foreground">{service.service_name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {service.service_code} • {service.category?.name}
                                            </div>
                                            {service.service_description && (
                                                <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                    {service.service_description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
                <Button
                    onClick={handleContinue}
                    disabled={!collectionType || selectedServices.length === 0}
                    className="w-full py-6 text-base"
                    size="lg"
                >
                    Continue to Location
                </Button>
            </div>
        </div>
    );
}
