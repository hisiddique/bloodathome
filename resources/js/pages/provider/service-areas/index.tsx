import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ServiceArea {
    id: string;
    postcode_prefix: string;
    max_distance_miles: string | null;
    additional_travel_fee: string | null;
}

interface ProviderServiceAreasIndexProps {
    serviceAreas: ServiceArea[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Service Areas',
        href: '/service-areas',
    },
];

export default function ProviderServiceAreasIndex({
    serviceAreas = [],
}: ProviderServiceAreasIndexProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        postcode_prefix: '',
        max_distance_miles: '',
        additional_travel_fee: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/service-areas', {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this service area?')) {
            router.delete(`/service-areas/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Areas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Service Areas
                        </h2>
                        <p className="text-muted-foreground">
                            Manage the areas where you provide services
                        </p>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Area
                    </Button>
                </div>

                {serviceAreas.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="mb-4 text-muted-foreground">
                                No service areas added yet
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Service Area
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Areas</CardTitle>
                            <CardDescription>
                                {serviceAreas.length} area
                                {serviceAreas.length !== 1 ? 's' : ''} covered
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {serviceAreas.map((area) => (
                                    <div
                                        key={area.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="font-semibold">
                                                    {area.postcode_prefix}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {area.max_distance_miles
                                                        ? `Up to ${area.max_distance_miles} miles`
                                                        : 'No distance limit'}
                                                </div>
                                                {area.additional_travel_fee && parseFloat(area.additional_travel_fee) > 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Travel fee: £{parseFloat(area.additional_travel_fee).toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(area.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Service Area</DialogTitle>
                            <DialogDescription>
                                Add a postcode prefix area where you provide services
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="postcode_prefix">
                                        Postcode Prefix
                                    </Label>
                                    <Input
                                        id="postcode_prefix"
                                        value={data.postcode_prefix}
                                        onChange={(e) =>
                                            setData(
                                                'postcode_prefix',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g., SW1A or SW"
                                        maxLength={10}
                                    />
                                    {errors.postcode_prefix && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.postcode_prefix}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="max_distance_miles">
                                        Max Distance (miles, optional)
                                    </Label>
                                    <Input
                                        id="max_distance_miles"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.max_distance_miles}
                                        onChange={(e) =>
                                            setData('max_distance_miles', e.target.value)
                                        }
                                        placeholder="e.g., 10"
                                    />
                                    {errors.max_distance_miles && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.max_distance_miles}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="additional_travel_fee">
                                        Additional Travel Fee (£, optional)
                                    </Label>
                                    <Input
                                        id="additional_travel_fee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.additional_travel_fee}
                                        onChange={(e) =>
                                            setData('additional_travel_fee', e.target.value)
                                        }
                                        placeholder="0.00"
                                    />
                                    {errors.additional_travel_fee && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.additional_travel_fee}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Add Area
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
