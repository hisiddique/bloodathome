import { AddressForm } from '@/components/address-form';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Saved Addresses',
        href: '/addresses',
    },
    {
        title: 'Add New Address',
        href: '/addresses/create',
    },
];

export default function CreateAddress() {
    const handleCancel = () => {
        router.visit('/addresses');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Address" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Add New Address"
                        description="Add a new address for your appointments"
                    />

                    <AddressForm
                        action="/addresses"
                        method="post"
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
