import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputError from "@/components/input-error";
import { PasswordInput } from "@/components/ui/password-input";
import PublicLayout from "@/layouts/public-layout";
import { login } from "@/routes";
import { update } from "@/routes/password";
import { Form, Head } from "@inertiajs/react";
import { toast } from "sonner";

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [isComplete, setIsComplete] = useState(false);

    if (isComplete) {
        return (
            <>
                <Head title="Password Reset Complete" />

                <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                    <div className="w-full max-w-md text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground mb-4">
                            Password Reset Complete!
                        </h1>

                        <p className="text-muted-foreground mb-8">
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>

                        <Button onClick={() => router.visit(login())}>
                            Sign In
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Reset Password" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        Reset Your Password
                    </h1>
                    <p className="text-muted-foreground text-center mb-8">
                        Enter your new password below. Make sure it's at least 8 characters.
                    </p>

                    <Form
                        {...update.form()}
                        transform={(data) => ({ ...data, token, email })}
                        resetOnSuccess={["password", "password_confirmation"]}
                        className="space-y-5"
                        onSuccess={() => {
                            setIsComplete(true);
                            toast.success("Password reset!", {
                                description: "You can now sign in with your new password",
                            });
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Hidden email field for form submission */}
                                <div className="hidden">
                                    <input type="hidden" name="email" value={email} />
                                    <input type="hidden" name="token" value={token} />
                                </div>

                                {/* Display email (read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Email Address
                                    </label>
                                    <div className="px-4 py-4 bg-muted border border-border rounded-2xl text-muted-foreground">
                                        {email}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                        New Password
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        autoFocus
                                        placeholder="Enter new password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-foreground mb-2">
                                        Confirm New Password
                                    </label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        required
                                        placeholder="Confirm new password"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={processing} className="w-full py-6 text-base">
                                        {processing ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </div>

                                <p className="text-center text-muted-foreground">
                                    Remember your password?{" "}
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

ResetPassword.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
