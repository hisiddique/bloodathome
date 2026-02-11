import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, MapPin, Plus, Star, Trash2 } from 'lucide-react';

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
        href: '/addresses',
    },
];

export default function Addresses({ addresses = [] }: AddressesProps) {
    const handleSetDefault = (addressId: string) => {
        router.put(`/addresses/${addressId}/default`, {});
    };

    const handleDelete = (addressId: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            router.delete(`/addresses/${addressId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Saved Addresses" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Saved Addresses</h1>
                        <p className="text-muted-foreground">
                            Manage your saved addresses for quick booking
                        </p>
                    </div>
                    <Link href="/addresses/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Add Address
                        </Button>
                    </Link>
                </div>

                {addresses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MapPin className="mb-4 size-16 text-muted-foreground" />
                            <CardTitle className="mb-2">
                                No saved addresses
                            </CardTitle>
                            <CardDescription>
                                Add your first address to speed up booking
                            </CardDescription>
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
                                        <Link href={`/addresses/${address.id}/edit`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Edit className="mr-2 size-4" />
                                                Edit
                                            </Button>
                                        </Link>
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
        </AppLayout>
    );
}
