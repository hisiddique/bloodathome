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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ServiceCategory {
    id: string;
    name: string;
}

interface Service {
    id: string;
    service_name: string;
    service_description: string | null;
    category: ServiceCategory | null;
}

interface ServiceActiveStatus {
    id: string;
    name: string;
}

interface ProviderService {
    id: string;
    service_id: string;
    base_cost: string;
    agreed_commission_percent: string;
    start_date: string;
    end_date: string | null;
    service: Service | null;
    status: ServiceActiveStatus | null;
}

interface ProviderServicesIndexProps {
    providerServices: ProviderService[];
    availableServices: Service[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Services',
        href: '/services',
    },
];

export default function ProviderServicesIndex({
    providerServices = [],
    availableServices = [],
}: ProviderServicesIndexProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<ProviderService | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        service_id: '',
        base_cost: '',
        agreed_commission_percent: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });

    const openCreateDialog = () => {
        reset();
        setEditingService(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (providerService: ProviderService) => {
        setEditingService(providerService);
        setData({
            service_id: providerService.service_id,
            base_cost: providerService.base_cost,
            agreed_commission_percent: providerService.agreed_commission_percent,
            start_date: providerService.start_date,
            end_date: providerService.end_date ?? '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingService) {
            put(`/services/${editingService.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        } else {
            post('/services', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this service?')) {
            router.delete(`/services/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Services
                        </h2>
                        <p className="text-muted-foreground">
                            Manage your services and pricing
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} disabled={availableServices.length === 0 && providerServices.length > 0}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Button>
                </div>

                {providerServices.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="mb-4 text-muted-foreground">
                                No services added yet
                            </p>
                            <Button onClick={openCreateDialog} disabled={availableServices.length === 0}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Service
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {providerServices.map((providerService) => (
                            <Card key={providerService.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>
                                                {providerService.service?.service_name ?? 'Unknown Service'}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {providerService.service?.category?.name ?? 'Uncategorised'}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditDialog(providerService)
                                                }
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDelete(providerService.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        {providerService.service?.service_description ?? 'No description available.'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">
                                            £{parseFloat(providerService.base_cost).toFixed(2)}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                providerService.status?.name === 'Active'
                                                    ? 'text-green-600'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {providerService.status?.name ?? 'Unknown'}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Commission: {providerService.agreed_commission_percent}%
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingService
                                    ? 'Edit Service'
                                    : 'Add New Service'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingService
                                    ? 'Update your service pricing and dates'
                                    : 'Add a service from the catalogue to your offerings'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {!editingService && (
                                    <div>
                                        <Label htmlFor="service_id">Service</Label>
                                        <Select
                                            value={data.service_id}
                                            onValueChange={(value) =>
                                                setData('service_id', value)
                                            }
                                        >
                                            <SelectTrigger id="service_id">
                                                <SelectValue placeholder="Select a service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableServices.map((service) => (
                                                    <SelectItem
                                                        key={service.id}
                                                        value={service.id}
                                                    >
                                                        {service.service_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.service_id && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.service_id}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="base_cost">
                                            Base Cost (£)
                                        </Label>
                                        <Input
                                            id="base_cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.base_cost}
                                            onChange={(e) =>
                                                setData('base_cost', e.target.value)
                                            }
                                            placeholder="0.00"
                                        />
                                        {errors.base_cost && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.base_cost}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="agreed_commission_percent">
                                            Commission (%)
                                        </Label>
                                        <Input
                                            id="agreed_commission_percent"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={data.agreed_commission_percent}
                                            onChange={(e) =>
                                                setData(
                                                    'agreed_commission_percent',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                        />
                                        {errors.agreed_commission_percent && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.agreed_commission_percent}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData('start_date', e.target.value)
                                            }
                                        />
                                        {errors.start_date && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="end_date">
                                            End Date (optional)
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) =>
                                                setData('end_date', e.target.value)
                                            }
                                        />
                                        {errors.end_date && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.end_date}
                                            </p>
                                        )}
                                    </div>
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
                                    {editingService ? 'Update' : 'Add Service'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
