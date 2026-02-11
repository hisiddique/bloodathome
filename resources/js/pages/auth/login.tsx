import { Link, router } from "@inertiajs/react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { PasswordInput } from '@/components/ui/password-input';
import PublicLayout from '@/layouts/public-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { toast } from 'sonner';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    redirect?: string;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
    redirect,
}: LoginProps) {
    // Get redirect from URL query params if not passed as prop
    const redirectUrl = redirect || new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
    return (
        <>
            <Head title="Sign In" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>

                    {status && (
                        <div className="mb-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="space-y-6"
                        onSuccess={() => {
                            toast.success("Welcome back!", {
                                description: "Login successful",
                            });
                            // Redirect to intended URL after successful login
                            if (redirectUrl && redirectUrl !== '/dashboard') {
                                router.visit(redirectUrl);
                            }
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Hidden field for redirect URL */}
                                <input type="hidden" name="redirect" value={redirectUrl} />
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                            <input
                                                id="email"
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
                                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                            Password
                                        </label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            placeholder="Enter your password"
                                        />
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

                                <Button type="submit" disabled={processing} className="w-full py-6 text-base">
                                    {processing ? "Signing in..." : "Sign In"}
                                </Button>

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
                </div>
            </div>
        </>
    );
}

Login.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
