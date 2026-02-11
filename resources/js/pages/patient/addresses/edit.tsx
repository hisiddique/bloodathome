import { AddressForm } from '@/components/address-form';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Address {
    id: string;
    label: string;
    address_line1: string;
    address_line2?: string;
    town_city: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
    is_default: boolean;
}

interface EditAddressProps {
    address: Address;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Saved Addresses',
        href: '/addresses',
    },
    {
        title: 'Edit Address',
        href: '#',
    },
];

export default function EditAddress({ address }: EditAddressProps) {
    const handleCancel = () => {
        router.visit('/addresses');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Address" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Edit Address"
                        description="Update your address details"
                    />

                    <AddressForm
                        initialData={address}
                        action={`/addresses/${address.id}`}
                        method="patch"
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
