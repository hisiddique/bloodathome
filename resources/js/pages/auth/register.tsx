import { useState } from 'react';
import { Link, router } from "@inertiajs/react";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/ui/password-input';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import PublicLayout from '@/layouts/public-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { toast } from 'sonner';

interface RegisterProps {
    redirect?: string;
}

export default function Register({ redirect }: RegisterProps) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    // Get redirect from URL query params if not passed as prop
    const redirectUrl = redirect || new URLSearchParams(window.location.search).get('redirect') || '/dashboard';

    return (
        <>
            <Head title="Create Account" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        className="space-y-5"
                        onSuccess={() => {
                            toast.success("Account created!", {
                                description: "Welcome to BloodAtHome",
                            });
                            // Redirect to intended URL after successful registration
                            if (redirectUrl && redirectUrl !== '/dashboard') {
                                router.visit(redirectUrl);
                            }
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Hidden field for redirect URL */}
                                <input type="hidden" name="redirect" value={redirectUrl} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-2">
                                            First Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                            <input
                                                id="first_name"
                                                type="text"
                                                name="first_name"
                                                required
                                                autoFocus
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
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                            <input
                                                id="last_name"
                                                type="text"
                                                name="last_name"
                                                required
                                                placeholder="Last name"
                                                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <InputError message={errors.last_name} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-foreground mb-2">
                                        Date of Birth *
                                    </label>
                                    <DatePicker
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        placeholder="Select your date of birth"
                                        variant="dob-adult"
                                        required
                                    />
                                    <InputError message={errors.date_of_birth} />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="Enter your email"
                                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                        Password *
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
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
                                        name="password_confirmation"
                                        required
                                        placeholder="Confirm your password"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="terms_accepted"
                                            checked={termsAccepted}
                                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                            className="mt-1"
                                        />
                                        <input type="hidden" name="terms_accepted" value={termsAccepted ? '1' : '0'} />
                                        <label htmlFor="terms_accepted" className="text-sm text-foreground leading-relaxed">
                                            I confirm that I am 18 years or older, or I have the consent of a parent/guardian. I agree to the{" "}
                                            <a href="#" className="text-primary font-medium hover:underline">
                                                Terms & Conditions
                                            </a>{" "}
                                            and{" "}
                                            <a href="#" className="text-primary font-medium hover:underline">
                                                Privacy Policy
                                            </a>
                                            . *
                                        </label>
                                    </div>
                                    <InputError message={errors.terms_accepted} />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={processing || !termsAccepted} className="w-full py-6 text-base">
                                        {processing ? "Creating Account..." : "Create Account"}
                                    </Button>
                                </div>

                                <p className="text-center text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link href={login()} className="text-primary font-semibold">
                                        Sign In
                                    </Link>
                                </p>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-background text-muted-foreground">or</span>
                                    </div>
                                </div>

                                <p className="text-center text-muted-foreground">
                                    Are you a phlebotomist?{" "}
                                    <Link href="/become-phlebotomist" className="text-primary font-semibold">
                                        Join our network
                                    </Link>
                                </p>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

Register.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
