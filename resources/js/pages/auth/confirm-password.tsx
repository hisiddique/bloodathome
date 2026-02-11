import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputError from "@/components/input-error";
import { PasswordInput } from "@/components/ui/password-input";
import PublicLayout from "@/layouts/public-layout";
import { store } from "@/routes/password/confirm";
import { Form, Head } from "@inertiajs/react";

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm Password" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2">
                        Confirm Your Password
                    </h1>
                    <p className="text-muted-foreground text-center mb-8">
                        This is a secure area. Please confirm your password before continuing.
                    </p>

                    <Form
                        {...store.form()}
                        resetOnSuccess={["password"]}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                        Password
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        autoFocus
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <Button type="submit" disabled={processing} className="w-full py-6 text-base">
                                    {processing ? "Confirming..." : "Confirm Password"}
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

ConfirmPassword.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
