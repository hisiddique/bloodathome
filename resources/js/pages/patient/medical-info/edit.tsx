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

interface MedicalInfo {
    nhs_number?: string;
    blood_type?: string;
    allergies?: string;
    medical_conditions?: string;
    medications?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
}

interface EditMedicalInfoProps {
    medicalInfo?: MedicalInfo;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Medical Information',
        href: '/medical-info',
    },
];

export default function EditMedicalInfo({
    medicalInfo,
}: EditMedicalInfoProps) {
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
                                                medicalInfo?.nhs_number
                                            }
                                            placeholder="123 456 7890"
                                        />
                                        <InputError
                                            message={errors.nhs_number}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="blood_type">
                                            Blood Type
                                        </Label>
                                        <select
                                            id="blood_type"
                                            name="blood_type"
                                            defaultValue={
                                                medicalInfo?.blood_type
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
                                            message={errors.blood_type}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="allergies">
                                        Allergies
                                    </Label>
                                    <Textarea
                                        id="allergies"
                                        name="allergies"
                                        defaultValue={medicalInfo?.allergies}
                                        placeholder="List any known allergies (e.g., medications, latex, etc.)"
                                        rows={3}
                                    />
                                    <InputError message={errors.allergies} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="medical_conditions">
                                        Medical Conditions
                                    </Label>
                                    <Textarea
                                        id="medical_conditions"
                                        name="medical_conditions"
                                        defaultValue={
                                            medicalInfo?.medical_conditions
                                        }
                                        placeholder="List any medical conditions (e.g., diabetes, hypertension, etc.)"
                                        rows={3}
                                    />
                                    <InputError
                                        message={errors.medical_conditions}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="medications">
                                        Current Medications
                                    </Label>
                                    <Textarea
                                        id="medications"
                                        name="medications"
                                        defaultValue={medicalInfo?.medications}
                                        placeholder="List any medications you are currently taking"
                                        rows={3}
                                    />
                                    <InputError message={errors.medications} />
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h3 className="mb-4 font-semibold">
                                        Emergency Contact
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="emergency_contact_name">
                                                Name
                                            </Label>
                                            <Input
                                                id="emergency_contact_name"
                                                name="emergency_contact_name"
                                                defaultValue={
                                                    medicalInfo?.emergency_contact_name
                                                }
                                                placeholder="Emergency contact name"
                                            />
                                            <InputError
                                                message={
                                                    errors.emergency_contact_name
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="emergency_contact_phone">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="emergency_contact_phone"
                                                type="tel"
                                                name="emergency_contact_phone"
                                                defaultValue={
                                                    medicalInfo?.emergency_contact_phone
                                                }
                                                placeholder="+44 20 1234 5678"
                                            />
                                            <InputError
                                                message={
                                                    errors.emergency_contact_phone
                                                }
                                            />
                                        </div>
                                    </div>
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
