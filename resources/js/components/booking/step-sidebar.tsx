import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type BookingStep = "location" | "phlebotomist" | "details" | "payment" | "success";

interface Step {
  id: BookingStep;
  title: string;
}

const STEPS: Step[] = [
  { id: "location", title: "Location & Schedule" },
  { id: "phlebotomist", title: "Select Phlebotomist" },
  { id: "details", title: "Patient Details" },
  { id: "payment", title: "Payment" },
  { id: "success", title: "Confirmation" },
];

interface StepSidebarProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
}

export function StepSidebar({ currentStep, onStepClick }: StepSidebarProps) {
  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Booking Steps</h2>
        <nav aria-label="Booking progress">
          <ol className="space-y-2">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFuture = index > currentStepIndex;
              const isClickable = isCompleted;

              const StepWrapper = isClickable ? 'button' : 'div';

              return (
                <li key={step.id}>
                  <StepWrapper
                    onClick={isClickable ? () => onStepClick?.(step.id) : undefined}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left",
                      isCurrent && "bg-primary/10 text-primary",
                      isCompleted && "text-muted-foreground hover:bg-muted cursor-pointer",
                      isFuture && "text-muted-foreground/50"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0",
                        isCurrent && "bg-primary text-primary-foreground",
                        isCompleted && "bg-green-500 text-white",
                        isFuture && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="font-medium text-sm">{step.title}</span>
                  </StepWrapper>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </aside>
  );
}

export default StepSidebar;
