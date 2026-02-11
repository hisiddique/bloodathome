import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Camera, Upload } from 'lucide-react';
import { useState } from 'react';

interface Provider {
    id: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    experience_years: number;
    qualifications: string;
    photo_url?: string;
    hourly_rate: number;
}

interface ProviderProfileEditProps {
    provider: Provider;
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
        provider.photo_url || null,
    );

    const { data, setData, post, processing, errors } = useForm({
        name: provider.name || '',
        email: provider.email || '',
        phone: provider.phone || '',
        bio: provider.bio || '',
        experience_years: provider.experience_years?.toString() || '',
        qualifications: provider.qualifications || '',
        hourly_rate: provider.hourly_rate?.toString() || '',
        photo: null as File | null,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profile" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Profile Settings
                    </h2>
                    <p className="text-muted-foreground">
                        Update your profile information
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Photo</CardTitle>
                            <CardDescription>
                                Upload a professional photo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={photoPreview || ''} />
                                    <AvatarFallback>
                                        {data.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()}
                                    </AvatarFallback>
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
                                    {errors.photo && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.photo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="hourly_rate">
                                        Hourly Rate (£)
                                    </Label>
                                    <Input
                                        id="hourly_rate"
                                        type="number"
                                        step="0.01"
                                        value={data.hourly_rate}
                                        onChange={(e) =>
                                            setData(
                                                'hourly_rate',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.hourly_rate && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.hourly_rate}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
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
                                {errors.bio && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.bio}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="experience_years">
                                    Years of Experience
                                </Label>
                                <Input
                                    id="experience_years"
                                    type="number"
                                    value={data.experience_years}
                                    onChange={(e) =>
                                        setData(
                                            'experience_years',
                                            e.target.value,
                                        )
                                    }
                                />
                                {errors.experience_years && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.experience_years}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="qualifications">
                                    Qualifications & Certifications
                                </Label>
                                <Textarea
                                    id="qualifications"
                                    value={data.qualifications}
                                    onChange={(e) =>
                                        setData('qualifications', e.target.value)
                                    }
                                    placeholder="List your qualifications..."
                                    rows={3}
                                />
                                {errors.qualifications && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.qualifications}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
