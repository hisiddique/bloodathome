import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';

interface Dependent {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    relationship: string;
    nhs_number?: string;
    allergies?: string;
    medical_conditions?: string;
    medications?: string;
}

interface EditDependentProps {
    dependent: Dependent;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dependents',
        href: '/dependents',
    },
    {
        title: 'Edit Dependent',
        href: '#',
    },
];

export default function EditDependent({ dependent }: EditDependentProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Dependent" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Edit Dependent"
                        description="Update dependent information"
                    />

                    <Form
                        action={`/dependents/${dependent.id}`}
                        method="put"
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">
                                            First Name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            defaultValue={dependent.first_name}
                                            required
                                            placeholder="John"
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            defaultValue={dependent.last_name}
                                            required
                                            placeholder="Smith"
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="date_of_birth">
                                            Date of Birth
                                        </Label>
                                        <DatePicker
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            defaultValue={dependent.date_of_birth}
                                            required
                                            variant="dob"
                                            placeholder="Select date of birth"
                                        />
                                        <InputError message={errors.date_of_birth} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="relationship">
                                            Relationship
                                        </Label>
                                        <select
                                            id="relationship"
                                            name="relationship"
                                            defaultValue={dependent.relationship}
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select relationship</option>
                                            <option value="child">Child</option>
                                            <option value="spouse">Spouse</option>
                                            <option value="parent">Parent</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <InputError message={errors.relationship} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="nhs_number">
                                        NHS Number (Optional)
                                    </Label>
                                    <Input
                                        id="nhs_number"
                                        name="nhs_number"
                                        defaultValue={dependent.nhs_number}
                                        placeholder="1234567890"
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter 10-digit NHS number if known
                                    </p>
                                    <InputError message={errors.nhs_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="allergies">
                                        Allergies (Optional)
                                    </Label>
                                    <Textarea
                                        id="allergies"
                                        name="allergies"
                                        defaultValue={dependent.allergies}
                                        placeholder="List any known allergies"
                                        rows={3}
                                    />
                                    <InputError message={errors.allergies} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="medical_conditions">
                                        Medical Conditions (Optional)
                                    </Label>
                                    <Textarea
                                        id="medical_conditions"
                                        name="medical_conditions"
                                        defaultValue={dependent.medical_conditions}
                                        placeholder="List any medical conditions"
                                        rows={3}
                                    />
                                    <InputError message={errors.medical_conditions} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="medications">
                                        Current Medications (Optional)
                                    </Label>
                                    <Textarea
                                        id="medications"
                                        name="medications"
                                        defaultValue={dependent.medications}
                                        placeholder="List any current medications"
                                        rows={3}
                                    />
                                    <InputError message={errors.medications} />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        Update Dependent
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href="/dependents">Cancel</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
