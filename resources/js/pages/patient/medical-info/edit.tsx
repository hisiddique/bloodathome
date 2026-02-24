import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';

interface Patient {
    nhs_number?: string | null;
    known_blood_type?: string | null;
    known_allergies?: string | null;
    current_medications?: string | null;
    medical_conditions?: string | null;
}

interface EditMedicalInfoProps {
    patient?: Patient | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Medical Information',
        href: '/medical-info',
    },
];

export default function EditMedicalInfo({ patient }: EditMedicalInfoProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medical Information" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Medical Information"
                        description="Keep your medical information up to date for safer blood tests"
                    />

                    <Form
                        action="/medical-info"
                        method="put"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nhs_number">
                                            NHS Number
                                        </Label>
                                        <Input
                                            id="nhs_number"
                                            name="nhs_number"
                                            defaultValue={
                                                patient?.nhs_number ?? ''
                                            }
                                            placeholder="123 456 7890"
                                        />
                                        <InputError
                                            message={errors.nhs_number}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="known_blood_type">
                                            Blood Type
                                        </Label>
                                        <select
                                            id="known_blood_type"
                                            name="known_blood_type"
                                            defaultValue={
                                                patient?.known_blood_type ?? ''
                                            }
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Unknown</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                        <InputError
                                            message={errors.known_blood_type}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="known_allergies">
                                        Allergies
                                    </Label>
                                    <Textarea
                                        id="known_allergies"
                                        name="known_allergies"
                                        defaultValue={
                                            patient?.known_allergies ?? ''
                                        }
                                        placeholder="List any known allergies (e.g., medications, latex, etc.)"
                                        rows={3}
                                    />
                                    <InputError
                                        message={errors.known_allergies}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="medical_conditions">
                                        Medical Conditions
                                    </Label>
                                    <Textarea
                                        id="medical_conditions"
                                        name="medical_conditions"
                                        defaultValue={
                                            patient?.medical_conditions ?? ''
                                        }
                                        placeholder="List any medical conditions (e.g., diabetes, hypertension, etc.)"
                                        rows={3}
                                    />
                                    <InputError
                                        message={errors.medical_conditions}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="current_medications">
                                        Current Medications
                                    </Label>
                                    <Textarea
                                        id="current_medications"
                                        name="current_medications"
                                        defaultValue={
                                            patient?.current_medications ?? ''
                                        }
                                        placeholder="List any medications you are currently taking"
                                        rows={3}
                                    />
                                    <InputError
                                        message={errors.current_medications}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>
                                        Save Changes
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
