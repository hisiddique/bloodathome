import { Link, router, usePage } from "@inertiajs/react";
import { Mail, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/layouts/public-layout";
import { logout } from "@/routes";
import { Head } from "@inertiajs/react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { props } = usePage();
    const user = props.auth?.user as { email?: string } | undefined;
    const [otpSent, setOtpSent] = useState(!!status);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (status) {
            setCountdown(15);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOtp = async () => {
        setSending(true);
        setError(null);

        try {
            const response = await axios.post("/email/send-otp");

            if (response.data.success) {
                setOtpSent(true);
                setCountdown(15);
                toast.success("Code sent!", {
                    description: "Check your email for the verification code",
                });
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            } else {
                setError(response.data.message || "Failed to send code");
            }
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                "Failed to send verification code. Please try again.";
            setError(message);
            toast.error("Error", { description: message });
        } finally {
            setSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        setVerifying(true);
        setError(null);

        try {
            const response = await axios.post("/email/verify-otp", {
                otp: otpValue,
            });

            if (response.data.success) {
                toast.success("Email verified!", {
                    description: "Redirecting to dashboard...",
                });
                setTimeout(() => {
                    router.visit("/dashboard");
                }, 1000);
            } else {
                setError(response.data.message || "Invalid verification code");
            }
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                "Invalid verification code. Please try again.";
            setError(message);
            toast.error("Verification failed", { description: message });
        } finally {
            setVerifying(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError(null);

        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);

        if (!/^\d+$/.test(pastedData)) {
            return;
        }

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        setError(null);

        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    return (
        <>
            <Head title="Verify Your Email" />

            <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        {otpSent ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : (
                            <Mail className="w-8 h-8 text-primary" />
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        {otpSent ? "Code Sent!" : "Verify Your Email"}
                    </h1>

                    <p className="text-muted-foreground mb-8">
                        {otpSent ? (
                            <>
                                Enter the 6-digit code sent to:
                                <br />
                                <span className="font-medium text-foreground">
                                    {user?.email}
                                </span>
                            </>
                        ) : (
                            <>
                                We'll send a 6-digit verification code to:
                                <br />
                                <span className="font-medium text-foreground">
                                    {user?.email}
                                </span>
                            </>
                        )}
                    </p>

                    {!otpSent ? (
                        <div className="space-y-4">
                            <Button
                                onClick={handleSendOtp}
                                disabled={sending}
                                className="w-full"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Verification Code
                                    </>
                                )}
                            </Button>

                            <div className="pt-4">
                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Use a different email
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) =>
                                            (inputRefs.current[index] = el)
                                        }
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) =>
                                            handleOtpChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(index, e)
                                        }
                                        onPaste={
                                            index === 0
                                                ? handlePaste
                                                : undefined
                                        }
                                        className="w-12 h-14 text-center text-xl font-semibold"
                                        disabled={verifying}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p className="text-sm text-red-600">{error}</p>
                            )}

                            <Button
                                onClick={handleVerifyOtp}
                                disabled={
                                    verifying || otp.join("").length !== 6
                                }
                                className="w-full"
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Code"
                                )}
                            </Button>

                            <div className="text-sm text-muted-foreground">
                                {countdown > 0 ? (
                                    <p>
                                        Resend code in{" "}
                                        <span className="font-medium">
                                            {countdown}s
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={sending}
                                        className="text-primary hover:underline disabled:opacity-50"
                                    >
                                        {sending
                                            ? "Sending..."
                                            : "Resend code"}
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 border-t">
                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Use a different email
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-muted/50 rounded-2xl">
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the code? Check your spam folder or
                            make sure you entered the correct email address
                            during registration.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

VerifyEmail.layout = (page: React.ReactNode) => (
    <PublicLayout>{page}</PublicLayout>
);
