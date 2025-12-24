import { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { BookingHeader } from "@/components/booking/header";
import { ConfirmButton } from "@/components/booking/confirm-button";
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { toast } from 'sonner';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Sign In" />

            <div className="min-h-screen bg-background">
                <div className="px-4">
                    <BookingHeader title="Sign In" onBack={() => router.visit("/")} />
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="px-6 py-8 space-y-6"
                    onSuccess={() => {
                        toast.success("Welcome back!", {
                            description: "Login successful",
                        });
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            placeholder="Enter your email"
                                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            placeholder="Enter your password"
                                            className="w-full pl-12 pr-12 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                            </div>

                            {canResetPassword && (
                                <div className="text-right">
                                    <TextLink href={request()} className="text-sm text-primary font-medium">
                                        Forgot password?
                                    </TextLink>
                                </div>
                            )}

                            <ConfirmButton type="submit" disabled={processing}>
                                {processing ? "Signing in..." : "Sign In"}
                            </ConfirmButton>

                            {canRegister && (
                                <p className="text-center text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link href={register()} className="text-primary font-semibold">
                                        Register
                                    </Link>
                                </p>
                            )}
                        </>
                    )}
                </Form>

                {status && (
                    <div className="px-6 mb-4 text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
            </div>
        </>
    );
}
