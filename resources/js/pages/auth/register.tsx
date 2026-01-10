import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { ConfirmButton } from "@/components/booking/confirm-button";
import InputError from '@/components/input-error';
import PublicLayout from '@/layouts/public-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { toast } from 'sonner';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

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
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            placeholder="Enter your full name"
                                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
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
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            placeholder="Create a password"
                                            className="w-full pl-12 pr-12 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-foreground mb-2">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                        <input
                                            id="password_confirmation"
                                            type={showPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            required
                                            placeholder="Confirm your password"
                                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="pt-4">
                                    <ConfirmButton type="submit" disabled={processing}>
                                        {processing ? "Creating Account..." : "Create Account"}
                                    </ConfirmButton>
                                </div>

                                <p className="text-center text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link href={login()} className="text-primary font-semibold">
                                        Sign In
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
