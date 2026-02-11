import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoDismissAlertProps {
    title: string;
    message: string;
    /** Auto-dismiss after this many milliseconds. Defaults to 8000 (8s). Set to 0 to disable. */
    duration?: number;
    /** Called when the alert is dismissed (auto or manual). */
    onDismiss?: () => void;
    className?: string;
}

export function AutoDismissAlert({
    title,
    message,
    duration = 8000,
    onDismiss,
    className,
}: AutoDismissAlertProps) {
    const [closing, setClosing] = useState(false);
    const [removed, setRemoved] = useState(false);

    const dismiss = () => {
        if (closing) {
            return;
        }
        setClosing(true);
    };

    // Auto-dismiss timer
    useEffect(() => {
        if (duration <= 0) {
            return;
        }

        const timer = setTimeout(dismiss, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    // After close animation finishes, remove from DOM and notify parent
    useEffect(() => {
        if (!closing) {
            return;
        }

        const timer = setTimeout(() => {
            setRemoved(true);
            onDismiss?.();
        }, 300);

        return () => clearTimeout(timer);
    }, [closing, onDismiss]);

    if (removed) {
        return null;
    }

    return (
        <Alert
            className={cn(
                'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200 transition-all duration-300',
                closing
                    ? 'opacity-0 -translate-y-2 scale-95'
                    : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-2 duration-300',
                className,
            )}
        >
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-200 pr-6">{title}</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">{message}</AlertDescription>
            <button
                type="button"
                onClick={dismiss}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </Alert>
    );
}
