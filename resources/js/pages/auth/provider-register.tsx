import { useState } from "react";
import { Link, router, Head, useForm } from "@inertiajs/react";
import { User, Mail, Phone, MapPin, FileText, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputError from "@/components/input-error";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import PublicLayout from "@/layouts/public-layout";
import { login } from "@/routes";
import { store } from "@/routes/phlebotomist";

interface ProviderType {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    providerTypes: ProviderType[];
}

export default function ProviderRegister({ providerTypes }: Props) {
    const [isComplete, setIsComplete] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        provider_type_id: "",
        address_line1: "",
        address_line2: "",
        town_city: "",
        postcode: "",
        experience_years: "",
        bio: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(store(), {
            onSuccess: () => {
                setIsComplete(true);
            },
            onError: () => {
                toast.error("Registration failed", {
                    description: "Please check the form for errors",
                });
            },
        });
    };

    if (isComplete) {
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
                        Thank you for registering as a phlebotomist. Your application is now under review.
                        Our team will verify your details and get back to you within 2-3 business days.
                    </p>
                    <Button onClick={() => router.visit("/dashboard")}>
                        Go to Dashboard
                    </Button>
                    <button
                        onClick={() => router.visit("/")}
                        className="mt-4 text-primary font-medium"
                    >
                        Back to Home
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Become a Mobile Phlebotomist" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
                        Become a Mobile Phlebotomist
                    </h1>

                    <div className="bg-accent/50 rounded-2xl p-4 mb-8">
                        <h2 className="font-semibold text-foreground mb-2">Join Our Network</h2>
                        <p className="text-sm text-muted-foreground">
                            Working as a mobile phlebotomist is a great way to earn extra money
                            alongside your main role. You can accept appointments that suit your
                            availability, giving you full control over when and how often you work.
                            We require all applicants to have strong clinical experience, a current
                            DBS check, recent training documentation, and proof of insurance.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-2">
                                        First Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="first_name"
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) => setData("first_name", e.target.value)}
                                            placeholder="First name"
                                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <InputError message={errors.first_name} />
                                </div>

                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-medium text-foreground mb-2">
                                        Last Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="last_name"
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) => setData("last_name", e.target.value)}
                                            placeholder="Last name"
                                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData("phone", e.target.value)}
                                        placeholder="Enter your phone number"
                                        className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                        Password *
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="Create a password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-foreground mb-2">
                                        Confirm Password *
                                    </label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        placeholder="Confirm password"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>

                        {/* Provider Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Provider Information</h3>

                            <div className="mb-4">
                                <label htmlFor="provider_type_id" className="block text-sm font-medium text-foreground mb-2">
                                    Provider Type *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <select
                                        id="provider_type_id"
                                        value={data.provider_type_id}
                                        onChange={(e) => setData("provider_type_id", e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                    >
                                        <option value="">Select provider type</option>
                                        {providerTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <InputError message={errors.provider_type_id} />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="experience_years" className="block text-sm font-medium text-foreground mb-2">
                                    Years of Experience *
                                </label>
                                <select
                                    id="experience_years"
                                    value={data.experience_years}
                                    onChange={(e) => setData("experience_years", e.target.value)}
                                    className="w-full px-4 py-4 bg-card border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                >
                                    <option value="">Select experience</option>
                                    <option value="0">Less than 1 year</option>
                                    <option value="1">1-2 years</option>
                                    <option value="3">3-5 years</option>
                                    <option value="5">5-10 years</option>
                                    <option value="10">10+ years</option>
                                </select>
                                <InputError message={errors.experience_years} />
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                                    About You
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                                    <textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData("bio", e.target.value)}
                                        placeholder="Tell us about your experience and qualifications..."
                                        rows={4}
                                        className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>
                                <InputError message={errors.bio} />
                            </div>
                        </div>

                        {/* Service Area */}
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Service Area</h3>

                            <div className="mb-4">
                                <label htmlFor="address_line1" className="block text-sm font-medium text-foreground mb-2">
                                    Address Line 1 *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="address_line1"
                                        type="text"
                                        value={data.address_line1}
                                        onChange={(e) => setData("address_line1", e.target.value)}
                                        placeholder="Street address"
                                        className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <InputError message={errors.address_line1} />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="address_line2" className="block text-sm font-medium text-foreground mb-2">
                                    Address Line 2
                                </label>
                                <input
                                    id="address_line2"
                                    type="text"
                                    value={data.address_line2}
                                    onChange={(e) => setData("address_line2", e.target.value)}
                                    placeholder="Apartment, suite, etc. (optional)"
                                    className="w-full px-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <InputError message={errors.address_line2} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="town_city" className="block text-sm font-medium text-foreground mb-2">
                                        Town/City *
                                    </label>
                                    <input
                                        id="town_city"
                                        type="text"
                                        value={data.town_city}
                                        onChange={(e) => setData("town_city", e.target.value)}
                                        placeholder="City"
                                        className="w-full px-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <InputError message={errors.town_city} />
                                </div>

                                <div>
                                    <label htmlFor="postcode" className="block text-sm font-medium text-foreground mb-2">
                                        Postcode *
                                    </label>
                                    <input
                                        id="postcode"
                                        type="text"
                                        value={data.postcode}
                                        onChange={(e) => setData("postcode", e.target.value.toUpperCase())}
                                        placeholder="SW1A 1AA"
                                        className="w-full px-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <InputError message={errors.postcode} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={processing} className="w-full py-6 text-base">
                                {processing ? "Submitting Application..." : "Submit Application"}
                            </Button>
                        </div>

                        <p className="text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link href={login()} className="text-primary font-semibold">
                                Sign In
                            </Link>
                        </p>

                        <p className="text-center text-sm text-muted-foreground">
                            Looking to book a test instead?{" "}
                            <Link href="/register" className="text-primary font-semibold">
                                Create a patient account
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}

ProviderRegister.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
