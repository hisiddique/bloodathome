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
import { CreditCard, Plus, Star, Trash2 } from 'lucide-react';

interface PaymentMethod {
    id: string;
    card_brand: string;
    card_last_four: string;
    card_exp_month: number;
    card_exp_year: number;
    is_default: boolean;
}

interface PaymentMethodsProps {
    paymentMethods?: PaymentMethod[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Methods',
        href: '/payment-methods',
    },
];

export default function PaymentMethods({
    paymentMethods = [],
}: PaymentMethodsProps) {
    const handleSetDefault = (paymentMethodId: string) => {
        router.patch(`/payment-methods/${paymentMethodId}/default`, {});
    };

    const handleDelete = (paymentMethodId: string) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            router.delete(`/payment-methods/${paymentMethodId}`);
        }
    };

    const getCardIcon = (brand: string) => {
        return <CreditCard className="size-6" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Methods" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Payment Methods</h1>
                        <p className="text-muted-foreground">
                            Manage your saved payment methods
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/payment-methods/create">
                            <Plus className="mr-2 size-4" />
                            Add Payment Method
                        </Link>
                    </Button>
                </div>

                {paymentMethods.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CreditCard className="mb-4 size-16 text-muted-foreground" />
                            <CardTitle className="mb-2">
                                No payment methods
                            </CardTitle>
                            <CardDescription>
                                Add a payment method to make bookings easier
                            </CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {paymentMethods.map((method) => (
                            <Card key={method.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {getCardIcon(method.card_brand)}
                                            <div>
                                                <CardTitle className="text-lg capitalize">
                                                    {method.card_brand} ····{' '}
                                                    {method.card_last_four}
                                                </CardTitle>
                                                <CardDescription>
                                                    Expires {method.card_exp_month}/
                                                    {method.card_exp_year}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {method.is_default && (
                                            <Star className="size-5 fill-yellow-400 text-yellow-400" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        {!method.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleSetDefault(method.id)
                                                }
                                            >
                                                Set as Default
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(method.id)
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
