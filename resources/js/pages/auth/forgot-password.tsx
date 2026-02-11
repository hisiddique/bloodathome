import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputError from "@/components/input-error";
import PublicLayout from "@/layouts/public-layout";
import { login } from "@/routes";
import { email } from "@/routes/password";
import { Form, Head } from "@inertiajs/react";
import { toast } from "sonner";

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const [emailSent, setEmailSent] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    if (emailSent || status) {
        return (
            <>
                <Head title="Check Your Email" />

                <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                    <div className="w-full max-w-md text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground mb-4">
                            Check Your Email
                        </h1>

                        <p className="text-muted-foreground mb-8">
                            {status || `We've sent a password reset link to ${submittedEmail}. Please check your inbox and follow the instructions to reset your password.`}
                        </p>

                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the email? Check your spam folder or{" "}
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-primary font-medium hover:underline"
                                >
                                    try again
                                </button>
                            </p>

                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Forgot Password" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-muted-foreground text-center mb-8">
                        No worries! Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <Form
                        {...email.form()}
                        className="space-y-6"
                        onSuccess={(page) => {
                            const emailInput = document.getElementById("email") as HTMLInputElement;
                            setSubmittedEmail(emailInput?.value || "");
                            setEmailSent(true);
                            toast.success("Email sent!", {
                                description: "Check your inbox for the reset link",
                            });
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
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

                                <Button type="submit" disabled={processing} className="w-full py-6 text-base">
                                    {processing ? "Sending..." : "Send Reset Link"}
                                </Button>

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

ForgotPassword.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
