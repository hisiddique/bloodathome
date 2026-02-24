import { Head, router } from "@inertiajs/react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/layouts/public-layout";

export default function ProviderRegisterComplete() {
    return (
        <>
            <Head title="Registration Complete" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] flex flex-col items-center justify-center px-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
                    Registration Complete!
                </h1>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                    Thank you for registering as a provider. Your application is now under review.
                    Our team will verify your details and get back to you within 2-3 business days.
                </p>
                <Button onClick={() => router.visit("/")}>
                    Back to Home
                </Button>
            </div>
        </>
    );
}

ProviderRegisterComplete.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
