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
import { Badge } from '@/components/ui/badge';
import ProviderLayout from '@/layouts/provider-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ServiceArea {
    id: string;
    postcode: string;
    city: string;
    is_active: boolean;
}

interface ProviderServiceAreasIndexProps {
    service_areas: ServiceArea[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/provider/dashboard',
    },
    {
        title: 'Service Areas',
        href: '/provider/service-areas',
    },
];

export default function ProviderServiceAreasIndex({
    service_areas = [],
}: ProviderServiceAreasIndexProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        postcode: '',
        city: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/provider/service-areas', {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this service area?')) {
            router.delete(`/provider/service-areas/${id}`);
        }
    };

    return (
        <ProviderLayout breadcrumbs={breadcrumbs}>
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

                {service_areas.length === 0 ? (
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
                            <CardTitle>Active Service Areas</CardTitle>
                            <CardDescription>
                                {service_areas.length} area
                                {service_areas.length !== 1 ? 's' : ''} covered
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {service_areas.map((area) => (
                                    <div
                                        key={area.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="font-semibold">
                                                    {area.postcode}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {area.city}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {area.is_active && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600"
                                                >
                                                    Active
                                                </Badge>
                                            )}
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
                                Add a new postcode area where you provide
                                services
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="postcode">
                                        Postcode / Area Code
                                    </Label>
                                    <Input
                                        id="postcode"
                                        value={data.postcode}
                                        onChange={(e) =>
                                            setData(
                                                'postcode',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g., SW1A 1AA or SW1A"
                                    />
                                    {errors.postcode && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.postcode}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="city">City / Town</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) =>
                                            setData('city', e.target.value)
                                        }
                                        placeholder="e.g., London"
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.city}
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
        </ProviderLayout>
    );
}
