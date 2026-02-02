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
import { Textarea } from '@/components/ui/textarea';
import ProviderLayout from '@/layouts/provider-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    is_active: boolean;
}

interface ProviderServicesIndexProps {
    services: Service[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/provider/dashboard',
    },
    {
        title: 'Services',
        href: '/provider/services',
    },
];

export default function ProviderServicesIndex({
    services = [],
}: ProviderServicesIndexProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        price: '',
        duration: '',
        is_active: true,
    });

    const openCreateDialog = () => {
        reset();
        setEditingService(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (service: Service) => {
        setEditingService(service);
        setData({
            name: service.name,
            description: service.description,
            price: service.price.toString(),
            duration: service.duration.toString(),
            is_active: service.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingService) {
            put(`/provider/services/${editingService.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        } else {
            post('/provider/services', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            router.delete(`/provider/services/${id}`);
        }
    };

    return (
        <ProviderLayout breadcrumbs={breadcrumbs}>
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
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Button>
                </div>

                {services.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="mb-4 text-muted-foreground">
                                No services added yet
                            </p>
                            <Button onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Service
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <Card key={service.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>{service.name}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {service.duration} minutes
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditDialog(service)
                                                }
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDelete(service.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        {service.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">
                                            £{service.price.toFixed(2)}
                                        </span>
                                        <span
                                            className={`text-sm ${service.is_active ? 'text-green-600' : 'text-muted-foreground'}`}
                                        >
                                            {service.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </div>
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
                                    ? 'Update your service details'
                                    : 'Add a new service to your offerings'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Service Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g., Blood Test"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Describe your service"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">
                                            Price (£)
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData('price', e.target.value)
                                            }
                                            placeholder="0.00"
                                        />
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="duration">
                                            Duration (mins)
                                        </Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={data.duration}
                                            onChange={(e) =>
                                                setData(
                                                    'duration',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="30"
                                        />
                                        {errors.duration && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.duration}
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
                                    {editingService ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </ProviderLayout>
    );
}
