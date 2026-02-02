import { Check } from 'lucide-react';
import { type BookingStep } from '@/types';
import { cn } from '@/lib/utils';

interface BookingSidebarProps {
    currentStep: BookingStep;
    onStepClick?: (step: BookingStep) => void;
}

const steps: { key: BookingStep; label: string; description: string }[] = [
    { key: 'collection', label: 'Collection & Services', description: 'Choose test type' },
    { key: 'location', label: 'Location & Time', description: 'When and where' },
    { key: 'provider', label: 'Provider', description: 'Select professional' },
    { key: 'patient', label: 'Patient Details', description: 'Your information' },
    { key: 'payment', label: 'Payment', description: 'Complete booking' },
];

export function BookingSidebar({ currentStep, onStepClick }: BookingSidebarProps) {
    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
        <aside className="w-full">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-8">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Booking Progress</h2>
                    {steps.map((step, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = step.key === currentStep;
                        const isClickable = isCompleted && onStepClick;

                        return (
                            <button
                                key={step.key}
                                type="button"
                                onClick={() => isClickable && onStepClick(step.key)}
                                disabled={!isClickable}
                                className={cn(
                                    'w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left',
                                    isCurrent && 'bg-primary/10 border border-primary',
                                    !isCurrent && 'hover:bg-accent/50',
                                    isClickable && 'cursor-pointer',
                                    !isClickable && 'cursor-default'
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors',
                                        isCompleted && 'bg-primary text-primary-foreground',
                                        isCurrent && 'bg-primary text-primary-foreground',
                                        !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div
                                        className={cn(
                                            'text-sm font-medium truncate',
                                            isCurrent ? 'text-primary' : 'text-foreground'
                                        )}
                                    >
                                        {step.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{step.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="lg:hidden mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                        Step {currentIndex + 1} of {steps.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {steps[currentIndex]?.label}
                    </span>
                </div>
                <div className="flex gap-1">
                    {steps.map((step, index) => (
                        <div
                            key={step.key}
                            className={cn(
                                'h-1 rounded-full flex-1 transition-colors',
                                index <= currentIndex ? 'bg-primary' : 'bg-muted'
                            )}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
}
