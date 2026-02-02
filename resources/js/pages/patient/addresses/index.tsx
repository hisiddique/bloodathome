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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PatientLayout from '@/layouts/patient-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, router } from '@inertiajs/react';
import { MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Address {
    id: string;
    label: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    postcode: string;
    is_default: boolean;
}

interface AddressesProps {
    addresses?: Address[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Saved Addresses',
        href: '/patient/addresses',
    },
];

export default function Addresses({ addresses = [] }: AddressesProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleSetDefault = (addressId: string) => {
        router.put(`/patient/addresses/${addressId}/default`, {});
    };

    const handleDelete = (addressId: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            router.delete(`/patient/addresses/${addressId}`);
        }
    };

    return (
        <PatientLayout breadcrumbs={breadcrumbs}>
            <Head title="Saved Addresses" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Saved Addresses</h1>
                        <p className="text-muted-foreground">
                            Manage your saved addresses for quick booking
                        </p>
                    </div>
                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Address
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                                <DialogDescription>
                                    Add a new address to your saved addresses
                                </DialogDescription>
                            </DialogHeader>
                            <Form
                                action="/patient/addresses"
                                method="post"
                                onSuccess={() => setIsAddDialogOpen(false)}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="label">
                                                Label (e.g., Home, Work)
                                            </Label>
                                            <Input
                                                id="label"
                                                name="label"
                                                required
                                                placeholder="Home"
                                            />
                                            {errors.label && (
                                                <p className="text-sm text-destructive">
                                                    {errors.label}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="address_line1">
                                                Address Line 1
                                            </Label>
                                            <Input
                                                id="address_line1"
                                                name="address_line1"
                                                required
                                                placeholder="123 Main Street"
                                            />
                                            {errors.address_line1 && (
                                                <p className="text-sm text-destructive">
                                                    {errors.address_line1}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="address_line2">
                                                Address Line 2 (Optional)
                                            </Label>
                                            <Input
                                                id="address_line2"
                                                name="address_line2"
                                                placeholder="Apartment 4B"
                                            />
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="city">
                                                    City
                                                </Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    required
                                                    placeholder="London"
                                                />
                                                {errors.city && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.city}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="postcode">
                                                    Postcode
                                                </Label>
                                                <Input
                                                    id="postcode"
                                                    name="postcode"
                                                    required
                                                    placeholder="SW1A 1AA"
                                                />
                                                {errors.postcode && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.postcode}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1"
                                            >
                                                Save Address
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setIsAddDialogOpen(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                {addresses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MapPin className="mb-4 size-16 text-muted-foreground" />
                            <CardTitle className="mb-2">
                                No saved addresses
                            </CardTitle>
                            <CardDescription className="mb-4">
                                Add your first address to speed up booking
                            </CardDescription>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="mr-2 size-4" />
                                Add Address
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {addresses.map((address) => (
                            <Card key={address.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="size-5 text-muted-foreground" />
                                            <CardTitle className="text-lg">
                                                {address.label}
                                            </CardTitle>
                                        </div>
                                        {address.is_default && (
                                            <Star className="size-5 fill-yellow-400 text-yellow-400" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>{address.address_line1}</p>
                                        {address.address_line2 && (
                                            <p>{address.address_line2}</p>
                                        )}
                                        <p>
                                            {address.city}, {address.postcode}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        {!address.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleSetDefault(address.id)
                                                }
                                            >
                                                Set as Default
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(address.id)
                                            }
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PatientLayout>
    );
}
