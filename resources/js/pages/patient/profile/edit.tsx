import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';

interface Patient {
    date_of_birth?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    town_city?: string | null;
    postcode?: string | null;
}

interface EditProfileProps {
    user: User & {
        first_name: string;
        middle_name?: string | null;
        last_name: string;
        phone?: string | null;
    };
    patient?: Patient | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile',
        href: '/profile',
    },
];

export default function EditProfile({ user, patient }: EditProfileProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profile" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile Information"
                        description="Update your personal information and contact details"
                    />

                    <Form
                        action="/profile"
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
                                        <Label htmlFor="first_name">
                                            First Name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            defaultValue={user.first_name}
                                            required
                                            autoComplete="given-name"
                                            placeholder="John"
                                        />
                                        <InputError
                                            message={errors.first_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            defaultValue={user.last_name}
                                            required
                                            autoComplete="family-name"
                                            placeholder="Doe"
                                        />
                                        <InputError
                                            message={errors.last_name}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="middle_name">
                                        Middle Name{' '}
                                        <span className="text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                        defaultValue={user.middle_name ?? ''}
                                        autoComplete="additional-name"
                                        placeholder="Middle name"
                                    />
                                    <InputError message={errors.middle_name} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={user.email}
                                            disabled
                                            autoComplete="email"
                                            className="cursor-not-allowed opacity-60"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Email cannot be changed here.
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            defaultValue={user.phone ?? ''}
                                            required
                                            autoComplete="tel"
                                            placeholder="+44 20 1234 5678"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date_of_birth">
                                        Date of Birth
                                    </Label>
                                    <DatePicker
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        variant="dob"
                                        placeholder="Select date of birth"
                                        defaultValue={
                                            patient?.date_of_birth ?? undefined
                                        }
                                    />
                                    <InputError
                                        message={errors.date_of_birth}
                                    />
                                </div>

                                <div className="rounded-lg border p-4">
                                    <h3 className="mb-4 font-semibold">
                                        Address
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="address_line1">
                                                Address Line 1
                                            </Label>
                                            <Input
                                                id="address_line1"
                                                name="address_line1"
                                                defaultValue={
                                                    patient?.address_line1 ?? ''
                                                }
                                                required
                                                autoComplete="address-line1"
                                                placeholder="123 Main Street"
                                            />
                                            <InputError
                                                message={errors.address_line1}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="address_line2">
                                                Address Line 2{' '}
                                                <span className="text-muted-foreground">
                                                    (optional)
                                                </span>
                                            </Label>
                                            <Input
                                                id="address_line2"
                                                name="address_line2"
                                                defaultValue={
                                                    patient?.address_line2 ?? ''
                                                }
                                                autoComplete="address-line2"
                                                placeholder="Flat 4"
                                            />
                                            <InputError
                                                message={errors.address_line2}
                                            />
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="town_city">
                                                    Town / City
                                                </Label>
                                                <Input
                                                    id="town_city"
                                                    name="town_city"
                                                    defaultValue={
                                                        patient?.town_city ?? ''
                                                    }
                                                    required
                                                    autoComplete="address-level2"
                                                    placeholder="London"
                                                />
                                                <InputError
                                                    message={errors.town_city}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="postcode">
                                                    Postcode
                                                </Label>
                                                <Input
                                                    id="postcode"
                                                    name="postcode"
                                                    defaultValue={
                                                        patient?.postcode ?? ''
                                                    }
                                                    required
                                                    autoComplete="postal-code"
                                                    placeholder="SW1A 1AA"
                                                />
                                                <InputError
                                                    message={errors.postcode}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
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
