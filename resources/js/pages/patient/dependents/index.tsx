import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { CalendarDays, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Dependent {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    age: number;
    relationship: string;
    nhs_number?: string;
    allergies?: string;
    medical_conditions?: string;
    medications?: string;
}

interface DependentsProps {
    dependents: Dependent[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dependents',
        href: '/dependents',
    },
];

const relationshipLabels: Record<string, string> = {
    child: 'Child',
    spouse: 'Spouse',
    parent: 'Parent',
    other: 'Other',
};

export default function Dependents({ dependents = [] }: DependentsProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(null);

    const handleDelete = () => {
        if (selectedDependent) {
            router.delete(`/dependents/${selectedDependent.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSelectedDependent(null);
                },
            });
        }
    };

    const openDeleteDialog = (dependent: Dependent) => {
        setSelectedDependent(dependent);
        setDeleteDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dependents" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dependents</h1>
                        <p className="text-muted-foreground">
                            Manage profiles for family members you book for
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dependents/create">
                            <Plus className="mr-2 size-4" />
                            Add Dependent
                        </Link>
                    </Button>
                </div>

                {dependents.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="mb-4 size-16 text-muted-foreground" />
                            <CardTitle className="mb-2">No dependents</CardTitle>
                            <CardDescription>
                                Add family members to book appointments on their behalf
                            </CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {dependents.map((dependent) => (
                            <Card key={dependent.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                                <Users className="size-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {dependent.full_name}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {relationshipLabels[dependent.relationship]} • {dependent.age} years old
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CalendarDays className="size-4" />
                                            <span>Born {new Date(dependent.date_of_birth).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                        {dependent.nhs_number && (
                                            <p className="text-muted-foreground">
                                                NHS: {dependent.nhs_number}
                                            </p>
                                        )}
                                        {dependent.allergies && (
                                            <p className="text-muted-foreground">
                                                <span className="font-medium">Allergies:</span> {dependent.allergies}
                                            </p>
                                        )}
                                        {dependent.medical_conditions && (
                                            <p className="text-muted-foreground">
                                                <span className="font-medium">Conditions:</span> {dependent.medical_conditions}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={`/dependents/${dependent.id}/edit`}>
                                                <Edit className="mr-2 size-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openDeleteDialog(dependent)}
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Dependent</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedDependent?.full_name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
