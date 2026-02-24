import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, router, useForm } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useState } from 'react';

interface ProviderData {
    id: string;
    provider_name?: string | null;
    bio?: string | null;
    experience_years?: number | null;
    address_line1?: string | null;
    address_line2?: string | null;
    town_city?: string | null;
    postcode?: string | null;
    profile_image_url?: string | null;
    user?: {
        first_name: string;
        last_name: string;
        full_name: string;
        initials: string;
    } | null;
}

interface ProviderProfileEditProps {
    provider: ProviderData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Profile',
        href: '/profile',
    },
];

export default function ProviderProfileEdit({
    provider,
}: ProviderProfileEditProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        provider.profile_image_url ?? null,
    );

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            provider_name: provider.provider_name ?? '',
            bio: provider.bio ?? '',
            experience_years: provider.experience_years?.toString() ?? '',
            address_line1: provider.address_line1 ?? '',
            address_line2: provider.address_line2 ?? '',
            town_city: provider.town_city ?? '',
            postcode: provider.postcode ?? '',
        });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        router.post(
            '/profile/photo',
            { photo: file },
            { forceFormData: true, preserveScroll: true },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/profile', { preserveScroll: true });
    };

    const initials =
        provider.user?.initials ??
        (provider.provider_name
            ? provider.provider_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
            : '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profile" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile Settings"
                        description="Update your profile information"
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Photo */}
                        <div className="rounded-lg border p-4">
                            <h3 className="mb-4 font-semibold">
                                Profile Photo
                            </h3>
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={photoPreview ?? ''} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Label
                                        htmlFor="photo"
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 hover:bg-accent">
                                            <Camera className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                Change Photo
                                            </span>
                                        </div>
                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </Label>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        JPG, PNG or GIF. Max 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="rounded-lg border p-4">
                            <h3 className="mb-4 font-semibold">
                                Basic Information
                            </h3>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="provider_name">
                                        Provider / Business Name
                                    </Label>
                                    <Input
                                        id="provider_name"
                                        value={data.provider_name}
                                        onChange={(e) =>
                                            setData(
                                                'provider_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Your name or business name"
                                        required
                                    />
                                    <InputError
                                        message={errors.provider_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="experience_years">
                                        Years of Experience
                                    </Label>
                                    <Input
                                        id="experience_years"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={data.experience_years}
                                        onChange={(e) =>
                                            setData(
                                                'experience_years',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. 5"
                                    />
                                    <InputError
                                        message={errors.experience_years}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) =>
                                            setData('bio', e.target.value)
                                        }
                                        placeholder="Tell patients about yourself..."
                                        rows={4}
                                    />
                                    <InputError message={errors.bio} />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="rounded-lg border p-4">
                            <h3 className="mb-4 font-semibold">Address</h3>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="address_line1">
                                        Address Line 1
                                    </Label>
                                    <Input
                                        id="address_line1"
                                        value={data.address_line1}
                                        onChange={(e) =>
                                            setData(
                                                'address_line1',
                                                e.target.value,
                                            )
                                        }
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
                                        value={data.address_line2}
                                        onChange={(e) =>
                                            setData(
                                                'address_line2',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="address-line2"
                                        placeholder="Suite 100"
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
                                            value={data.town_city}
                                            onChange={(e) =>
                                                setData(
                                                    'town_city',
                                                    e.target.value,
                                                )
                                            }
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
                                            value={data.postcode}
                                            onChange={(e) =>
                                                setData(
                                                    'postcode',
                                                    e.target.value,
                                                )
                                            }
                                            autoComplete="postal-code"
                                            placeholder="SW1A 1AA"
                                        />
                                        <InputError message={errors.postcode} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
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
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
