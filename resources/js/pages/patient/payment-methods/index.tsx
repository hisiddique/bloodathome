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
import { CreditCard, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentMethod {
    id: string;
    type: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
}

interface PaymentMethodsProps {
    paymentMethods?: PaymentMethod[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Methods',
        href: '/patient/payment-methods',
    },
];

export default function PaymentMethods({
    paymentMethods = [],
}: PaymentMethodsProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleSetDefault = (paymentMethodId: string) => {
        router.put(`/patient/payment-methods/${paymentMethodId}/default`, {});
    };

    const handleDelete = (paymentMethodId: string) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            router.delete(`/patient/payment-methods/${paymentMethodId}`);
        }
    };

    const getCardIcon = (brand: string) => {
        return <CreditCard className="size-6" />;
    };

    return (
        <PatientLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Methods" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Payment Methods</h1>
                        <p className="text-muted-foreground">
                            Manage your saved payment methods
                        </p>
                    </div>
                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Add Payment Method
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Add New Payment Method
                                </DialogTitle>
                                <DialogDescription>
                                    Add a new credit or debit card
                                </DialogDescription>
                            </DialogHeader>
                            <Form
                                action="/patient/payment-methods"
                                method="post"
                                onSuccess={() => setIsAddDialogOpen(false)}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="card_number">
                                                Card Number
                                            </Label>
                                            <Input
                                                id="card_number"
                                                name="card_number"
                                                required
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                            />
                                            {errors.card_number && (
                                                <p className="text-sm text-destructive">
                                                    {errors.card_number}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="cardholder_name">
                                                Cardholder Name
                                            </Label>
                                            <Input
                                                id="cardholder_name"
                                                name="cardholder_name"
                                                required
                                                placeholder="John Doe"
                                            />
                                            {errors.cardholder_name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.cardholder_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="exp_month">
                                                    Expiry Month
                                                </Label>
                                                <Input
                                                    id="exp_month"
                                                    name="exp_month"
                                                    type="number"
                                                    required
                                                    placeholder="MM"
                                                    min="1"
                                                    max="12"
                                                />
                                                {errors.exp_month && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.exp_month}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="exp_year">
                                                    Expiry Year
                                                </Label>
                                                <Input
                                                    id="exp_year"
                                                    name="exp_year"
                                                    type="number"
                                                    required
                                                    placeholder="YYYY"
                                                    min={
                                                        new Date().getFullYear()
                                                    }
                                                />
                                                {errors.exp_year && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.exp_year}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                name="cvv"
                                                type="password"
                                                required
                                                placeholder="123"
                                                maxLength={4}
                                            />
                                            {errors.cvv && (
                                                <p className="text-sm text-destructive">
                                                    {errors.cvv}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1"
                                            >
                                                Save Card
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

                {paymentMethods.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CreditCard className="mb-4 size-16 text-muted-foreground" />
                            <CardTitle className="mb-2">
                                No payment methods
                            </CardTitle>
                            <CardDescription className="mb-4">
                                Add a payment method to make bookings easier
                            </CardDescription>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="mr-2 size-4" />
                                Add Payment Method
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {paymentMethods.map((method) => (
                            <Card key={method.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {getCardIcon(method.brand)}
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {method.brand}{' '}
                                                    {method.last4}
                                                </CardTitle>
                                                <CardDescription>
                                                    Expires {method.exp_month}/
                                                    {method.exp_year}
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
        </PatientLayout>
    );
}
